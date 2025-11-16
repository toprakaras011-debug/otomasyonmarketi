// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, 405);
  }

  try {
    const { to, message } = (await req.json()) as { to?: unknown; message?: unknown };

    if (typeof to !== "string" || typeof message !== "string" || !to.trim() || !message.trim()) {
      return json({ success: false, message: "Invalid payload" }, 400);
    }

    const sid = Deno.env.get("TWILIO_SID");
    const token = Deno.env.get("TWILIO_AUTH_TOKEN");
    const from = Deno.env.get("TWILIO_PHONE");

    if (!sid || !token || !from) {
      console.error("Twilio credentials are missing in function environment");
      return json({ success: false, message: "Twilio credentials missing" }, 500);
    }

    const auth = btoa(`${sid}:${token}`);
    const payload = new URLSearchParams({
      To: to,
      From: from,
      Body: message,
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Twilio API error", text);
      return json({ success: false, message: "Twilio API call failed" }, 502);
    }

    const data = (await response.json()) as { sid?: string };
    return json({ success: true, sid: data.sid });
  } catch (error) {
    console.error("send-sms function error", error);
    return json({ success: false, message: "Internal error" }, 500);
  }
});
