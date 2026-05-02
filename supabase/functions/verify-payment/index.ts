import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

// ─── PayU Live Config (all from secrets) ─────────────────────────────────────
const PAYU_KEY       = Deno.env.get("PAYU_KEY")!;
const PAYU_SALT_32   = Deno.env.get("PAYU_SALT_32")!;
const PAYU_CLIENT_ID = Deno.env.get("PAYU_CLIENT_ID")!;
const PAYU_CLIENT_SECRET = Deno.env.get("PAYU_CLIENT_SECRET")!;

// ─── Supabase Config ─────────────────────────────────────────────────────────
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ─── CORS Headers ────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── SHA-512 helper ──────────────────────────────────────────────────────────
function sha512(data: string): string {
  return createHash("sha512").update(data).digest("hex");
}

// ─── Verify PayU response hash ───────────────────────────────────────────────
// Reverse formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
function verifyPayUHash(params: Record<string, string>): boolean {
  const {
    status, udf5 = "", udf4 = "", udf3 = "", udf2 = "", udf1 = "",
    email, firstname, productinfo, amount, txnid, hash,
  } = params;

  const hashString = [
    PAYU_SALT_32,
    status,
    "", // udf10
    "", // udf9
    "", // udf8
    "", // udf7
    "", // udf6
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    PAYU_KEY,
  ].join("|");

  const computedHash = sha512(hashString);
  return computedHash === hash;
}

// ─── Get PayU OAuth token for Verify API ─────────────────────────────────────
async function getPayUToken(): Promise<string> {
  const res = await fetch("https://accounts.payu.in/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: PAYU_CLIENT_ID,
      client_secret: PAYU_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "create_payment_links",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayU token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ─── Verify transaction via PayU API ─────────────────────────────────────────
async function verifyWithPayUAPI(txnid: string): Promise<Record<string, unknown>> {
  const token = await getPayUToken();

  const res = await fetch("https://uatoneapi.payu.in/payment-confirm", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantKey: PAYU_KEY,
      txnId: txnid,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayU verify error: ${err}`);
  }

  return res.json();
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();

    // ── Mode 1: Verify via PayU webhook/redirect params (hash check) ──────────
    if (body.payu_response) {
      const params = body.payu_response as Record<string, string>;
      const isValid = verifyPayUHash(params);

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Hash mismatch — payment tampered" }),
          { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      const { txnid, status, udf1: booking_id, udf2: booking_table = "cma_mock_bookings" } = params;
      const paymentStatus = status === "success" ? "paid" : "failed";

      // Update booking in DB
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
      const { error } = await supabase
        .from(booking_table)
        .update({
          payment_status: paymentStatus,
          payment_txn_id: txnid,
          payment_verified_at: new Date().toISOString(),
        })
        .eq("id", booking_id);

      if (error) console.error("DB update error:", error);

      return new Response(
        JSON.stringify({ verified: true, status: paymentStatus, txnid }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── Mode 2: Manual txn_id lookup ──────────────────────────────────────────
    if (body.txn_id) {
      const payuData = await verifyWithPayUAPI(body.txn_id);

      return new Response(
        JSON.stringify({ verified: true, data: payuData }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Provide either payu_response or txn_id" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-payment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
