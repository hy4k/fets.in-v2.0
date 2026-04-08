import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, CreditCard, Copy, ArrowRight, RefreshCw } from 'lucide-react';
import { verifyPayment, getPaymentResultFromURL, clearPaymentURL } from '../lib/payment';

/**
 * PaymentStatusOverlay — automatically shown when user returns from PayU.
 * Verifies the payment via Edge Function and shows success/failure with details.
 */
export default function PaymentStatusOverlay({ onClose, onRetry }) {
  const [state, setState] = useState('verifying'); // verifying | success | failed | error
  const [payment, setPayment] = useState(null);
  const [txnId, setTxnId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const result = getPaymentResultFromURL();
    if (!result) {
      onClose?.();
      return;
    }

    // Use a ref-like approach: set initial state, then run async verification
    let cancelled = false;

    const verify = async () => {
      try {
        const data = await verifyPayment(result.txnId);
        if (cancelled) return;
        if (data.payment) {
          setPayment(data.payment);
          if (data.payment.status === 'success') {
            setState('success');
          } else if (data.payment.status === 'pending') {
            // Retry after a few seconds
            setTimeout(async () => {
              if (cancelled) return;
              try {
                const retry = await verifyPayment(result.txnId);
                if (cancelled) return;
                setPayment(retry.payment);
                setState(retry.payment?.status === 'success' ? 'success' : 'failed');
              } catch {
                if (!cancelled) setState('failed');
              }
            }, 5000);
          } else {
            setState('failed');
          }
        } else {
          setState(result.status === 'success' ? 'success' : 'failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        if (!cancelled) setState('error');
      }
    };

    setTxnId(result.txnId);
    verify();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    clearPaymentURL();
    onClose?.();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(txnId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-dark-950/90 backdrop-blur-xl"
      onClick={handleClose}>
      <div
        className="bg-dark-900/95 rounded-[2rem] p-8 md:p-10 max-w-md w-full relative border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient orbs */}
        {state === 'success' && (
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        )}
        {state === 'failed' && (
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
        )}
        {state === 'verifying' && (
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FFD000]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        )}

        <div className="relative z-10">
          {/* ─── VERIFYING ─── */}
          {state === 'verifying' && (
            <div className="py-8 text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-[#FFD000]/10 text-[#FFD000] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,208,0,0.15)]">
                <Loader2 size={36} className="animate-spin" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">
                Verifying Payment
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Please wait while we confirm your payment with the gateway…
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/20">
                <CreditCard size={14} /> Transaction: <span className="font-mono text-white/40">{txnId}</span>
              </div>
            </div>
          )}

          {/* ─── SUCCESS ─── */}
          {state === 'success' && (
            <div className="py-6 text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                Payment Successful!
              </h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Your mock exam booking has been confirmed.
                {payment?.customer_email && (
                  <> A confirmation will be sent to <span className="text-white/60 font-semibold">{payment.customer_email}</span>.</>
                )}
              </p>

              {/* Transaction details card */}
              <div className="mx-auto max-w-xs rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 mb-6 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Transaction ID</span>
                  <button onClick={handleCopy} className="text-white/30 hover:text-white/60 transition-colors" title="Copy">
                    <Copy size={12} />
                  </button>
                </div>
                <p className="text-sm font-black text-emerald-400 font-mono tracking-wider">
                  {txnId}
                </p>
                {copied && <p className="text-[10px] text-emerald-400/60">Copied!</p>}

                {payment?.amount && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Amount Paid</span>
                    <p className="text-lg font-black text-white mt-1">₹{Number(payment.amount).toLocaleString('en-IN')}</p>
                  </div>
                )}

                {payment?.payment_mode && (
                  <div>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Payment Mode</span>
                    <p className="text-sm font-bold text-white/60 mt-1">{payment.payment_mode}</p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-white/30 mb-6 leading-relaxed">
                Our team will confirm your slot via WhatsApp or call.<br />
                Keep this transaction ID for your reference.
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black text-sm hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Done <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ─── FAILED ─── */}
          {(state === 'failed' || state === 'error') && (
            <div className="py-6 text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                <XCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                Payment {state === 'error' ? 'Error' : 'Failed'}
              </h3>
              <p className="text-white/40 text-sm mb-4 leading-relaxed">
                {state === 'error'
                  ? 'We could not verify your payment status. Please contact support.'
                  : 'The payment was not completed successfully. No amount has been charged.'
                }
              </p>

              {payment?.error_message && (
                <div className="mx-auto max-w-xs rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 mb-6 text-left">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Error Details</span>
                  <p className="text-xs text-red-400/80 mt-1 font-medium">{payment.error_message}</p>
                </div>
              )}

              <div className="text-xs text-white/20 mb-6">
                Transaction: <span className="font-mono text-white/40">{txnId}</span>
              </div>

              <div className="flex flex-col gap-3">
                {onRetry && (
                  <button
                    onClick={() => { clearPaymentURL(); onRetry(); }}
                    className="w-full py-3.5 bg-[#FFD000] text-dark-950 rounded-xl font-black text-sm hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,208,0,0.2)]"
                  >
                    <RefreshCw size={16} /> Try Again
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
