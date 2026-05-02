import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

// ─── PayU Live Config (all from secrets, nothing hardcoded) ─────────────────
const PAYU_KEY  = Deno.env.get("PAYU_KEY")!;
const PAYU_SALT = Deno.env.get("PAYU_SALT_32")!;
const PAYU_URL  = "https://secure.payu.in/_payment"; // Live endpoint
const SITE_URL  = Deno.env.get("SITE_URL") || "https://fets.in";

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

// ─── Generate PayU hash ──────────────────────────────────────────────────────
// CRITICAL: hash must include the EXACT same udf values sent to PayU
// Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
function generatePayUHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  const hashString = [
    PAYU_KEY,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",   // udf1 — must match what's POSTed to PayU
    params.udf2 || "",   // udf2 — must match what's POSTed to PayU
    params.udf3 || "",   // udf3
    params.udf4 || "",   // udf4
    params.udf5 || "",   // udf5
    "",                  // additional field 1
    "",                  // additional field 2
    "",                  // additional field 3
    "",                  // additional field 4
    "",                  // additional field 5
    PAYU_SALT,
  ].join("|");

  return sha512(hashString);
}

// ─── Clean phone to 10 digits (PayU requires exactly 10-digit Indian number) ─
function cleanPhone(phone: string): string {
  // Strip spaces, dashes, country code (+91 or 91)
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0"))  return digits.slice(1);
  return digits.slice(-10); // take last 10 digits
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();
    const {
      booking_id,
      booking_table = "cma_mock_bookings",
      amount,
      customer_name,
      customer_email,
      customer_phone,
      product_info = "FETS Mock Exam Booking",
    } = body;

    // Validate required fields
    if (!booking_id || !amount || !customer_name || !customer_email || !customer_phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Generate unique transaction ID
    const txnid = `FETS_${booking_id}_${Date.now()}`;

    // Format amount to 2 decimal places (PayU requirement)
    const amountStr = parseFloat(amount).toFixed(2);

    // Clean phone to exactly 10 digits
    const phoneClean = cleanPhone(String(customer_phone));

    // First name only (PayU requirement)
    const firstname = customer_name.split(" ")[0];

    // udf values — these MUST match what's included in the hash
    const udf1 = String(booking_id);
    const udf2 = String(booking_table);

    // Generate PayU hash — udf1/udf2 MUST be included here
    const hash = generatePayUHash({
      txnid,
      amount: amountStr,
      productinfo: product_info,
      firstname,
      email: customer_email,
      udf1,
      udf2,
    });

    // Update booking record with txn ID
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
    const { error: updateError } = await supabase
      .from(booking_table)
      .update({ payment_txn_id: txnid, payment_status: "pending" })
      .eq("id", booking_id);

    if (updateError) {
      console.error("DB update error:", updateError);
      // Don't fail — payment can still proceed, we'll verify later
    }

    // surl/furl — PayU POSTs here after payment; SPA reads ?payment=success&txn=xxx
    const payuParams = {
      key: PAYU_KEY,
      txnid,
      amount: amountStr,
      productinfo: product_info,
      firstname,
      lastname: customer_name.split(" ").slice(1).join(" ") || "",
      email: customer_email,
      phone: phoneClean,
      surl: `${SITE_URL}/?payment=success&txn=${txnid}`,
      furl: `${SITE_URL}/?payment=failure&txn=${txnid}`,
      hash,
      udf1,   // booking ID — stored to look up on verify
      udf2,   // table name — stored to look up on verify
    };

    return new Response(
      JSON.stringify({
        payu_url: PAYU_URL,
        payu_params: payuParams,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("initiate-payment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
