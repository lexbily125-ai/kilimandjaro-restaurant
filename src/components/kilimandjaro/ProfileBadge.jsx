import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { ChevronDown, LogOut, ClipboardList, LayoutDashboard } from "lucide-react";

const ROLE_LABELS = { admin: "ADMIN", chef: "CHEF", user: "CUSTOMER" };
const ROLE_COLORS = {
  admin: "var(--k-gold)",
  chef: "var(--k-terracotta)",
  user: "rgba(255,255,255,0.08)",
};

export default function ProfileBadge() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const name = user.full_name || (user.email ? user.email.split("@")[0] : "User");
  const initials = name.trim().split(/\s+/).map((w) => w[0] || "").slice(0, 2).join("").toUpperCase() || "?";
  const role = (user.role || "user").toLowerCase();
  const roleLabel = ROLE_LABELS[role] || "CUSTOMER";
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.user;
  const dashboardLink = role === "admin" ? "/admin" : (role === "chef" || role === "staff") ? "/staff" : null;

  const handleSignOut = () => {
    setOpen(false);
    logout(true);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="k-focus flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors k-glass-pill"
        style={{ color: "var(--k-silk)" }}
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold"
          style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
        >
          {initials}
        </span>
        <span className="hidden text-xs font-bold sm:block" style={{ color: "var(--k-silk)" }}>
          {name.split(" ")[0]}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: roleColor, color: role === "user" ? "var(--k-silk)" : "var(--k-surface)" }}
        >
          {roleLabel}
        </span>
        <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--k-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[1500] mt-2 w-56 overflow-hidden rounded-2xl"
          style={{ backgroundColor: "var(--k-card)", border: "1px solid var(--k-line)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--k-line)" }}>
            <p className="truncate text-sm font-bold" style={{ color: "var(--k-silk)" }}>{name}</p>
            <p className="truncate text-xs" style={{ color: "var(--k-muted)" }}>{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
              style={{ color: "var(--k-silk)" }}
            >
              <ClipboardList className="h-4 w-4" style={{ color: "var(--k-muted)" }} />
              My Orders
            </Link>
            {dashboardLink && (
              <Link
                to={dashboardLink}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                style={{ color: "var(--k-silk)" }}
              >
                <LayoutDashboard className="h-4 w-4" style={{ color: "var(--k-gold)" }} />
                Management Dashboard
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
              style={{ color: "var(--k-terracotta)" }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}