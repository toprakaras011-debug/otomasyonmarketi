// @ts-nocheck
/// <reference path="../../../types/supabase-edge.d.ts" />

import Stripe from "npm:stripe@14.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type CreateStripeAccountRequest = {
  developerId: string;
  developerEmail?: string;
  refreshUrl?: string;
  returnUrl?: string;
};

type StripeAccountRow = {
  developer_id: string;
  stripe_account_id: string | null;
  onboarding_complete: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: CreateStripeAccountRequest = await req.json();

    if (!body?.developerId) {
      return new Response(
        JSON.stringify({ error: "developerId gereklidir" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const platformBaseUrl = Deno.env.get("PLATFORM_BASE_URL") ?? "https://otomasyonmagazasi.com.tr";

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Sunucu yapılandırması eksik" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const { data: existingAccount } = await supabase
      .from<StripeAccountRow>("stripe_accounts")
      .select("*")
      .eq("developer_id", body.developerId)
      .maybeSingle();

    let stripeAccountId = existingAccount?.stripe_account_id ?? null;
    let account;

    if (stripeAccountId) {
      account = await stripe.accounts.retrieve(stripeAccountId);
    } else {
      account = await stripe.accounts.create({
        type: "express",
        country: "TR",
        email: body.developerEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
    }

    const refreshUrl = body.refreshUrl ?? `${platformBaseUrl}/developer/stripe-onboarding?refresh=1`;
    const returnUrl = body.returnUrl ?? `${platformBaseUrl}/developer/stripe-onboarding?success=1`;

    let onboardingUrl: string | null = null;

    if (!account.details_submitted || !account.charges_enabled || !account.payouts_enabled) {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });
      onboardingUrl = accountLink.url;
    }

    const upsertPayload = {
      developer_id: body.developerId,
      stripe_account_id: stripeAccountId,
      onboarding_complete: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("stripe_accounts")
      .upsert(upsertPayload, { onConflict: "developer_id" });

    if (upsertError) {
      console.error("Stripe account upsert error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Stripe hesabı kaydedilemedi" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        stripeAccountId,
        onboardingUrl,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-stripe-connect-account error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message ?? "Bilinmeyen hata" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
