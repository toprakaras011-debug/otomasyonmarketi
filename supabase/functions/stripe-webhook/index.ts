import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeSecretKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe yapılandırması eksik" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const automationId = paymentIntent.metadata.automation_id;
      const automationIdsCsv = paymentIntent.metadata.automation_ids;
      const userId = paymentIntent.metadata.user_id;
      const developerId = paymentIntent.metadata.developer_id;
      const platformFee = parseFloat(paymentIntent.metadata.platform_fee || '0');
      const developerEarnings = parseFloat(paymentIntent.metadata.developer_earnings || '0');

      const { data: purchase, error: purchaseSelectError } = await supabase
        .from("purchases")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (purchaseSelectError) {
        console.error("Purchase select error:", purchaseSelectError);
      }

      if (purchase) {
        const { error: updateError } = await supabase
          .from("purchases")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (updateError) {
          console.error("Purchase update error:", updateError);
        }

        const { error: earningsError } = await supabase
          .from("platform_earnings")
          .insert({
            purchase_id: purchase.id,
            amount: platformFee,
            currency: "try",
            status: "completed",
          });

        if (earningsError) {
          console.error("Platform earnings error:", earningsError);
        }
      }

      // Satış sayısını artır: tek ürün ya da sepet ödemesi
      const idsToIncrement = automationIdsCsv
        ? automationIdsCsv.split(',').map((s) => s.trim()).filter(Boolean)
        : (automationId ? [automationId] : []);

      for (const id of idsToIncrement) {
        const { error: automationUpdateError } = await supabase.rpc(
          "increment_automation_sales",
          { automation_id: id }
        );
        if (automationUpdateError) {
          console.error("Automation sales update error:", id, automationUpdateError);
        }
      }

      console.log(`Payment succeeded: ${paymentIntent.id}, Amount: ${paymentIntent.amount / 100} TRY`);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          status: "failed",
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (updateError) {
        console.error("Purchase update error:", updateError);
      }

      console.log(`Payment failed: ${paymentIntent.id}`);
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;

      const { error: accountUpdateError } = await supabase
        .from("stripe_accounts")
        .update({
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
        })
        .eq("stripe_account_id", account.id);

      if (accountUpdateError) {
        console.error("Stripe account update error:", accountUpdateError);
      }

      console.log(`Account updated: ${account.id}`);
    }

    return new Response(
      JSON.stringify({ received: true, event: event.type }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
