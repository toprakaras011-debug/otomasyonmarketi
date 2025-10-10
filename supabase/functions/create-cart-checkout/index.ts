// @ts-nocheck
/// <reference path="../../../types/supabase-edge.d.ts" />

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartCheckoutRequest {
  automationIds: string[];
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { automationIds, userId }: CartCheckoutRequest = await req.json();

    if (!automationIds || !Array.isArray(automationIds) || automationIds.length === 0 || !userId) {
      return new Response(
        JSON.stringify({ error: "automationIds (array) ve userId gerekli" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe yapılandırması eksik" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const platformBaseUrl = Deno.env.get("PLATFORM_BASE_URL") ?? "https://otomasyonmagazasi.com.tr";

    const { data: automations, error: automationsError } = await supabase
      .from("automations")
      .select(`*, developer:user_profiles!automations_developer_id_fkey(*), stripe_account:stripe_accounts(*)`)
      .in("id", automationIds);

    if (automationsError || !automations || automations.length === 0) {
      return new Response(
        JSON.stringify({ error: "Otomasyon(lar) bulunamadı" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Grup kontrol: tüm ürünler tek geliştirici/tek connected account mı?
    const accounts = new Set(
      automations.map((a: any) => a?.stripe_account?.stripe_account_id).filter(Boolean)
    );

    if (accounts.size !== 1) {
      // Şimdilik tek geliştirici şartı
      const byDev: Record<string, string[]> = {};
      for (const a of automations as any[]) {
        const acc = a?.stripe_account?.stripe_account_id || 'none';
        if (!byDev[acc]) byDev[acc] = [];
        byDev[acc].push(a.id);
      }
      return new Response(
        JSON.stringify({ error: "Sepette farklı geliştiricilere ait ürünler var", groups: byDev }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeAccountId = [...accounts][0];
    if (!stripeAccountId) {
      return new Response(
        JSON.stringify({ error: "Geliştirici Stripe hesabı bağlamamış" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformFeePercentage = parseInt(Deno.env.get("PLATFORM_FEE_PERCENTAGE") || "15");
    const amountInTRY = (automations as any[]).reduce((s, a) => s + (a.price || 0), 0);
    const platformFee = (amountInTRY * platformFeePercentage) / 100;
    const developerEarnings = amountInTRY - platformFee;

    const amountInKurus = Math.round(amountInTRY * 100);
    const platformFeeInKurus = Math.round(platformFee * 100);

    const lineItems = (automations as any[]).map((a) => ({
      price_data: {
        currency: "try",
        product_data: {
          name: a.title,
          description: a.description ?? undefined,
        },
        unit_amount: Math.round((a.price || 0) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${platformBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${platformBaseUrl}/checkout/cancel`,
      line_items: lineItems,
      customer_email: (automations as any[])[0]?.developer?.email ?? undefined,
      payment_intent_data: {
        application_fee_amount: platformFeeInKurus,
        transfer_data: { destination: stripeAccountId },
        metadata: {
          automation_ids: automationIds.join(','),
          user_id: userId,
          platform_fee: platformFee.toFixed(2),
          developer_earnings: developerEarnings.toFixed(2),
        },
        description: `Sepet Ödemesi (${automations.length} ürün)`,
      },
      metadata: {
        automation_ids: automationIds.join(','),
        user_id: userId,
      },
    });

    // purchases kayıtları (pending)
    for (const a of automations as any[]) {
      const itemFee = ((a.price || 0) * platformFeePercentage) / 100;
      const { error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          user_id: userId,
          automation_id: a.id,
          price: a.price,
          platform_commission: itemFee,
          status: "pending",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        });
      if (purchaseError) {
        console.error("Purchase record error:", purchaseError);
      }
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        checkoutUrl: session.url,
        amount: amountInTRY,
        currency: "TRY",
        platformFee,
        developerEarnings,
        automationIds,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cart checkout error:", error);
    return new Response(
      JSON.stringify({ error: (error as any).message || "Bir hata oluştu" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
