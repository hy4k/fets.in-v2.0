import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

// ─── PayU Live Config (all from secrets, nothing hardcoded) ─────────────────
const PAYU_KEY  = Deno.env.get("PAYU_KEY")!;
const PAYU_SALT = Deno.env.get("PAYU_SALT_32")!;
const PAYU_URL  = "https://secure.payu.in/_payment"; // Live endpoint

// ─── Supabase Config ─────────────────────────────────────────────────────────
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
// Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1-5||||||SALT)
function generatePayUHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
}): string {
  const hashString = [
    PAYU_KEY,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    "", // udf1
    "", // udf2
    "", // udf3
    "", // udf4
    "", // udf5
    "", // udf6
    "", // udf7
    "", // udf8
    "", // udf9
    "", // udf10
    PAYU_SALT,
  ].join("|");

  return sha512(hashString);
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

    // Format amount to 2 decimal places
    const amountStr = parseFloat(amount).toFixed(2);

    // Generate PayU hash
    const hash = generatePayUHash({
      txnid,
      amount: amountStr,
      productinfo: product_info,
      firstname: customer_name.split(" ")[0],
      email: customer_email,
    });

    // Update booking record with txn ID (to track payment later)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
    const { error: updateError } = await supabase
      .from(booking_table)
      .update({ payment_txn_id: txnid, payment_status: "pending" })
      .eq("id", booking_id);

    if (updateError) {
      console.error("DB update error:", updateError);
      // Don't fail — payment can still proceed, we'll verify later
    }

    // Return all PayU parameters for the frontend to POST
    const payuParams = {
      key: PAYU_KEY,
      txnid,
      amount: amountStr,
      productinfo: product_info,
      firstname: customer_name.split(" ")[0],
      lastname: customer_name.split(" ").slice(1).join(" ") || "",
      email: customer_email,
      phone: customer_phone,
      surl: `${Deno.env.get("SITE_URL") || "https://fets.in"}/payment/success?txn=${txnid}`,
      furl: `${Deno.env.get("SITE_URL") || "https://fets.in"}/payment/failure?txn=${txnid}`,
      hash,
      udf1: booking_id,
      udf2: booking_table,
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
