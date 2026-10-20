import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-10 pt-20"
      style={{ background: "radial-gradient(130% 120% at 50% 0%, #1b150f 0%, #0D0C0A 55%, #050403 100%)" }}
    >
      {/* liquid light orbs */}
      <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(225,173,1,0.22), transparent 70%)", filter: "blur(42px)" }} />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(200,90,50,0.20), transparent 70%)", filter: "blur(50px)" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)", filter: "blur(36px)" }} />

      {/* Single-tap escape back to the menu — top-left, always visible */}
      <Link
        to="/"
        aria-label="Back to the menu"
        className="k-focus absolute left-4 top-4 z-20 inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold uppercase tracking-wide k-glass-pill"
        style={{ color: "var(--k-silk)" }}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" style={{ color: "var(--k-gold)" }} aria-hidden="true" />
        Back to Menu
      </Link>

      {/* Compact close affordance for narrow screens */}
      <Link
        to="/"
        aria-label="Close and return to the menu"
        className="k-focus absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full k-glass-pill sm:hidden"
        style={{ color: "var(--k-silk)" }}
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </Link>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <Icon className="h-8 w-8" style={{ color: "var(--k-gold)" }} aria-hidden="true" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight" style={{ color: "var(--k-silk)" }}>
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm" style={{ color: "var(--k-muted)" }}>{subtitle}</p>}
        </div>

        {/* liquid glass card */}
        <div
          className="relative rounded-3xl p-7 sm:p-8"
          style={{
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }} />
          {children}
        </div>

        {footer && <p className="mt-6 text-center text-sm" style={{ color: "var(--k-muted)" }}>{footer}</p>}
      </div>
    </div>
  );
}