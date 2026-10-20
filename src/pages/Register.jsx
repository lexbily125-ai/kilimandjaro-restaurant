import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const ssoBtn = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  color: "var(--k-silk)",
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      // persist optional profile fields for just-registered users
      try { await base44.auth.updateMe({ full_name: fullName }); } catch {}
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", safeReturnTo());

  if (showOtp) {
    return (
      <AuthLayout icon={Mail} title="Verify your email" subtitle={`We sent a code to ${email}`}>
        {error && (
          <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "rgba(200,90,50,0.12)", color: "var(--k-terracotta)" }}>{error}</div>
        )}
        <div className="mb-6 flex justify-center">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <button onClick={handleVerify} disabled={loading || otpCode.length < 6} className="k-focus flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide disabled:opacity-50" style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}>
          {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>) : "Verify"}
        </button>
        <p className="mt-4 text-center text-sm" style={{ color: "var(--k-muted)" }}>
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="font-medium hover:underline" style={{ color: "var(--k-gold)" }}>Resend</button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up for faster checkout & order tracking"
      footer={
        <>
          Already have an account?{" "}
          <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="font-medium hover:underline" style={{ color: "var(--k-gold)" }}>Log in</Link>
        </>
      }
    >
      <div className="space-y-3">
        <button onClick={handleGoogle} className="k-focus flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-95" style={ssoBtn}>
          <GoogleIcon className="h-5 w-5" /> Continue with Google
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-3 text-[11px] font-semibold tracking-wide" style={{ color: "var(--k-muted)" }}>or quick sign-up</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "rgba(200,90,50,0.12)", color: "var(--k-terracotta)" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="k-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(215) 000-0000" className="k-input" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} aria-hidden="true" />
            <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="k-input pl-10" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} aria-hidden="true" />
              <input type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="k-input pl-10" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Confirm</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} aria-hidden="true" />
              <input type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="k-input pl-10" required />
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="k-focus flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50" style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}>
          {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : "Create account"}
        </button>
        <p className="text-center text-[11px]" style={{ color: "var(--k-muted)" }}>
          Prefer not to create an account? You can always <span style={{ color: "var(--k-gold)" }}>check out as a guest</span>.
        </p>
      </form>
    </AuthLayout>
  );
}