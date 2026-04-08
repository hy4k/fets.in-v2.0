/**
 * FETS Payment Utilities — PayU Money Integration
 * Handles payment initiation, form submission to PayU, and verification.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://drhykmgwtxhghvzodwhz.supabase.co';

/**
 * Initiates a payment via the Supabase Edge Function.
 * Returns the PayU parameters needed to redirect to PayU checkout.
 */
export async function initiatePayment({
  bookingId,
  bookingTable = 'cma_mock_bookings',
  amount,
  customerName,
  customerEmail,
  customerPhone,
  productInfo = 'FETS Mock Exam Booking',
}) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/initiate-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_id: bookingId,
      booking_table: bookingTable,
      amount,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      product_info: productInfo,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to initiate payment');
  }

  return response.json();
}

/**
 * Submits a hidden form to PayU's payment URL.
 * This is the standard redirect-based checkout approach.
 */
export function redirectToPayU(payuUrl, payuParams) {
  // Create a hidden form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payuUrl;
  form.style.display = 'none';

  // Add all PayU parameters as hidden fields
  Object.entries(payuParams).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  // Append to body and submit
  document.body.appendChild(form);
  form.submit();
}

/**
 * Verifies a payment status after returning from PayU.
 * Calls the verify-payment Edge Function.
 */
export async function verifyPayment(txnId) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txn_id: txnId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to verify payment');
  }

  return response.json();
}

/**
 * Extracts payment result from URL parameters.
 * Called on page load to check if user returned from PayU.
 */
export function getPaymentResultFromURL() {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get('payment');
  const txnId = params.get('txn');

  if (!paymentStatus || !txnId) return null;

  return {
    status: paymentStatus, // 'success' or 'failure'
    txnId,
  };
}

/**
 * Cleans payment parameters from the URL without reloading the page.
 */
export function clearPaymentURL() {
  const url = new URL(window.location.href);
  url.searchParams.delete('payment');
  url.searchParams.delete('txn');
  window.history.replaceState({}, '', url.toString());
}
