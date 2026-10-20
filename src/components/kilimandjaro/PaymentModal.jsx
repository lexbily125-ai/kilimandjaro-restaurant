import React, { useState, useEffect } from "react";

function formatCardNumber(v) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export default function PaymentModal({ open, subtotal, tax, deliveryFee = 0, discount = 0, tip = 0, total, customer, orderId, onPaid, onClose }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setCardNumber("");
      setCardName("");
      setExp("");
      setCvc("");
      setProcessing(false);
      setSuccess(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const digits = cardNumber.replace(/\D/g, "");
  const valid =
    digits.length >= 13 &&
    digits.length <= 16 &&
    cardName.trim().length > 1 &&
    /^\d{2}\/\d{2}$/.test(exp) &&
    /^\d{3,4}$/.test(cvc);

  const handlePay = async () => {
    if (!valid) {
      setError("Please enter valid card details.");
      return;
    }
    setError("");
    setProcessing(true);
    try {
      await onPaid({ method: "card", last4: digits.slice(-4) });
      setProcessing(false);
      setSuccess(true);
    } catch (e) {
      setProcessing(false);
      setError("Payment could not be processed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1600] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl sm:max-w-md sm:rounded-2xl"
        style={{ backgroundColor: "var(--k-card)", border: "1px solid var(--k-line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--k-gold)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--k-surface)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-extrabold" style={{ color: "var(--k-silk)" }}>
              Boom! Order Placed
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--k-muted)", lineHeight: 1.6 }}>
              Thanks {customer?.name || ""}! We received your payment and started prepping your order.
              We'll text you when it's ready for pickup.
            </p>
            {orderId && (
              <div className="mt-4 rounded-xl px-4 py-3 k-glass-pill">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Your Order ID</p>
                <p className="font-heading text-lg font-extrabold tracking-widest" style={{ color: "var(--k-gold)" }}>
                  #{(orderId || "").slice(-6).toUpperCase()}
                </p>
                <p className="mt-1 text-[11px]" style={{ color: "var(--k-muted)" }}>Save this with your phone number to track your order.</p>
              </div>
            )}
            <button
              onClick={onClose}
              className="k-focus mt-8 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold uppercase tracking-wide"
              style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
            >
              Back to Menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--k-line)" }}>
              <h2 className="font-heading text-base font-extrabold uppercase tracking-tight" style={{ color: "var(--k-silk)" }}>
                Secure Payment
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="k-focus flex h-9 w-9 items-center justify-center rounded-full k-glass-pill"
                style={{ color: "var(--k-silk)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Order summary */}
              <div className="mb-5 rounded-xl p-4 k-glass-pill">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                  {customer?.orderType === "delivery" ? "Delivery · ASAP" : `Pickup · ${customer?.pickupTime || "ASAP"}`}
                </p>
                {customer?.orderType === "delivery" && customer?.deliveryAddress && (
                  <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>{customer.deliveryAddress}</p>
                )}
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between" style={{ color: "var(--k-muted)" }}>
                    <dt>Subtotal</dt>
                    <dd>${subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between" style={{ color: "var(--k-muted)" }}>
                    <dt>Est. Tax (8.0%)</dt>
                    <dd>${tax.toFixed(2)}</dd>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between" style={{ color: "var(--k-muted)" }}>
                      <dt>Delivery Fee</dt>
                      <dd>${deliveryFee.toFixed(2)}</dd>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between" style={{ color: "var(--k-terracotta)" }}>
                      <dt>Discount</dt>
                      <dd>−${discount.toFixed(2)}</dd>
                    </div>
                  )}
                  {tip > 0 && (
                    <div className="flex justify-between" style={{ color: "var(--k-gold)" }}>
                      <dt>Tip</dt>
                      <dd>${tip.toFixed(2)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 text-base font-extrabold" style={{ color: "var(--k-silk)" }}>
                    <dt>Total</dt>
                    <dd>${total.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              {/* Card inputs */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                    Card Number
                  </label>
                  <input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className="k-focus h-12 w-full rounded-lg px-3 text-sm k-glass-pill"
                    style={{ color: "var(--k-silk)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                    Name on Card
                  </label>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full name"
                    className="k-focus h-12 w-full rounded-lg px-3 text-sm k-glass-pill"
                    style={{ color: "var(--k-silk)" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                      Expiry
                    </label>
                    <input
                      value={exp}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                        setExp(v);
                      }}
                      placeholder="MM/YY"
                      className="k-focus h-12 w-full rounded-lg px-3 text-sm k-glass-pill"
                      style={{ color: "var(--k-silk)" }}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                      CVC
                    </label>
                    <input
                      inputMode="numeric"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      className="k-focus h-12 w-full rounded-lg px-3 text-sm k-glass-pill"
                      style={{ color: "var(--k-silk)" }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-xs" style={{ color: "var(--k-terracotta)" }}>
                  {error}
                </p>
              )}
            </div>

            <div className="px-5 py-4" style={{ borderTop: "1px solid var(--k-line)" }}>
              <button
                onClick={handlePay}
                disabled={!valid || processing}
                className="k-focus flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
              >
                {processing ? "Processing…" : `Pay $${total.toFixed(2)}`}
              </button>
              <p className="mt-2 text-center text-[11px]" style={{ color: "var(--k-muted)" }}>
                Demo only — no real card is charged.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}