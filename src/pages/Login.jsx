import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

const ADMIN_EMAILS = ["lexbily125@gmail.com", "isyoumaba70@gmail.com"];

const ssoBtn = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  color: "var(--k-silk)",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      try {
        const u = await base44.auth.me();
        const r = (u.role || "user").toLowerCase();
        if (r === "admin") window.location.href = "/admin";
        else if (r === "chef" || r === "staff") window.location.href = "/staff";
        else window.location.href = returnTo;
      } catch {
        window.location.href = returnTo;
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", returnTo);

  const isAdmin = ADMIN_EMAILS.includes(email.trim().toLowerCase());

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Sign in to your Kilimandjaro account"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="font-medium hover:underline"
            style={{ color: "var(--k-gold)" }}
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <button onClick={handleGoogle} className="k-focus flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-95" style={ssoBtn}>
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-3 text-[11px] font-semibold tracking-wide" style={{ color: "var(--k-muted)" }}>or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "rgba(200,90,50,0.12)", color: "var(--k-terracotta)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} aria-hidden="true" />
            <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="k-input pl-10" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Password</label>
            <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "var(--k-gold)" }}>Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} aria-hidden="true" />
            <input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="k-input pl-10" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="k-focus flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50" style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}>
          {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</>) : "Log in"}
        </button>
      </form>

      {isAdmin && (
        <div className="mt-5 flex items-center gap-2 rounded-xl p-3 text-xs" style={{ background: "rgba(225,173,1,0.10)", border: "1px solid rgba(225,173,1,0.25)", color: "var(--k-gold)" }}>
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Admin account recognized — the master password set in <span className="font-bold">/admin</span> is required after login.
        </div>
      )}
    </AuthLayout>
  );
}