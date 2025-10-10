import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  automationId: string;
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
    const { automationId, userId }: CheckoutRequest = await req.json();

    if (!automationId || !userId) {
      return new Response(
        JSON.stringify({ error: "automationId ve userId gerekli" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe yapılandırması eksik" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const { data: automation, error: automationError } = await supabase
      .from("automations")
      .select(`
        *,
        developer:user_profiles!automations_developer_id_fkey(*),
        stripe_account:stripe_accounts(*)
      `)
      .eq("id", automationId)
      .single();

    if (automationError || !automation) {
      return new Response(
        JSON.stringify({ error: "Otomasyon bulunamadı" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!automation.stripe_account || !automation.stripe_account.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Geliştirici Stripe hesabı bağlamamış" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const platformFeePercentage = parseInt(Deno.env.get("PLATFORM_FEE_PERCENTAGE") || "15");
    const amountInTRY = automation.price;
    const platformFee = (amountInTRY * platformFeePercentage) / 100;
    const developerEarnings = amountInTRY - platformFee;

    const amountInKurus = Math.round(amountInTRY * 100);
    const platformFeeInKurus = Math.round(platformFee * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInKurus,
      currency: "try",
      application_fee_amount: platformFeeInKurus,
      transfer_data: {
        destination: automation.stripe_account.stripe_account_id,
      },
      metadata: {
        automation_id: automationId,
        user_id: userId,
        developer_id: automation.developer_id,
        platform_fee: platformFee.toFixed(2),
        developer_earnings: developerEarnings.toFixed(2),
      },
      description: `${automation.title} - Otomasyon Satın Alma`,
    });

    const { error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: userId,
        automation_id: automationId,
        price: amountInTRY,
        platform_commission: platformFee,
        status: "pending",
        stripe_payment_intent_id: paymentIntent.id,
      });

    if (purchaseError) {
      console.error("Purchase record error:", purchaseError);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInTRY,
        currency: "TRY",
        platformFee: platformFee,
        developerEarnings: developerEarnings,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
