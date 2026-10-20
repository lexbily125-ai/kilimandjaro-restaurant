import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { UserPlus, Trash2, Loader2, ChefHat, ShieldCheck, Search, Users } from "lucide-react";

export default function StaffPanel() {
  const { settings } = useStoreSettings();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("chef");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userList, orderList] = await Promise.all([
        base44.entities.User.list("-created_date", 200),
        base44.entities.Order.list("-created_date", 500),
      ]);
      setUsers(userList || []);
      setOrders(orderList || []);
    } catch (e) {
      setUsers([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async () => {
    const em = email.trim().toLowerCase();
    if (!em || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      setMsg("Enter a valid staff email.");
      return;
    }
    setMsg("");
    setInviting(true);
    try {
      // Base44 inviteUser only accepts "admin" or "user"; for "chef" we invite as
      // "user" then patch the role to "chef" once the user record is available.
      const inviteRole = role === "admin" ? "admin" : "user";
      await base44.users.inviteUser(em, inviteRole);
      if (role === "chef") {
        try {
          const list = await base44.entities.User.list("-created_date", 200);
          const u = (list || []).find((x) => (x.email || "").toLowerCase() === em);
          if (u) await base44.entities.User.update(u.id, { role: "chef" });
        } catch (e) {
          // user may not have accepted the invite yet — role patches on next login
        }
      }
      setMsg(`Invite sent to ${em} as ${role === "admin" ? "Admin" : "Chef"}.`);
      setEmail("");
      load();
    } catch (e) {
      setMsg(e.message || "Could not invite staff member.");
    } finally {
      setInviting(false);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Remove ${u.email}?`)) return;
    try {
      await base44.entities.User.delete(u.id);
      load();
    } catch (e) {
      setMsg(e.message || "Could not remove user.");
    }
  };

  const staffUsers = users.filter((u) => u.role === "admin" || u.role === "chef");
  const customerUsers = users.filter((u) => (u.role || "user") === "user");

  const orderCountFor = (u) => {
    const name = (u.full_name || "").trim().toLowerCase();
    if (!name) return 0;
    return orders.filter((o) => (o.customer_name || "").trim().toLowerCase() === name).length;
  };

  const filteredCustomers = customerUsers.filter((u) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.trim().toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-2xl space-y-5">
      {/* Invite form */}
      <div className="rounded-2xl p-5 k-card">
        <h2 className="font-heading flex items-center gap-2 text-base font-bold" style={{ color: "var(--k-silk)" }}>
          <UserPlus className="h-4 w-4" style={{ color: "var(--k-gold)" }} /> Add Staff Member
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>
          Invite staff by email. Admins get full dashboard access; Chefs get the Kitchen portal. Both log in with standard email/password or Google.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className="k-input flex-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="k-input sm:w-48"
            style={{ backgroundColor: "var(--k-card)" }}
          >
            <option value="chef" style={{ background: "var(--k-card)" }}>Chef (Kitchen access)</option>
            <option value="admin" style={{ background: "var(--k-card)" }}>Admin (full access)</option>
          </select>
          <button
            onClick={invite}
            disabled={inviting}
            className="k-focus inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-bold uppercase tracking-wide disabled:opacity-50 sm:w-auto"
            style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
          >
            {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
          </button>
        </div>
        {msg && <p className="mt-3 text-xs" style={{ color: "var(--k-gold)" }}>{msg}</p>}
      </div>

      {/* Staff Directory */}
      <div className="rounded-2xl p-5 k-card">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wide" style={{ color: "var(--k-silk)" }}>
          Staff Directory ({staffUsers.length})
        </h3>
        {loading ? (
          <p className="mt-3 text-sm" style={{ color: "var(--k-muted)" }}>Loading…</p>
        ) : staffUsers.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "var(--k-muted)" }}>No staff yet. Invite a team member above.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {staffUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {u.role === "admin" ? (
                    <ShieldCheck className="h-4 w-4" style={{ color: "var(--k-gold)" }} />
                  ) : (
                    <ChefHat className="h-4 w-4" style={{ color: "var(--k-terracotta)" }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--k-silk)" }}>{u.full_name || u.email}</p>
                  <p className="truncate text-[11px]" style={{ color: "var(--k-muted)" }}>{u.email}</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: u.role === "admin" ? "rgba(225,173,1,0.15)" : "rgba(200,90,50,0.15)",
                    color: u.role === "admin" ? "var(--k-gold)" : "var(--k-terracotta)",
                  }}
                >
                  {u.role}
                </span>
                <button
                  onClick={() => remove(u)}
                  aria-label="Remove staff"
                  className="k-focus flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ color: "var(--k-terracotta)" }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Directory */}
      <div className="rounded-2xl p-5 k-card">
        <h3 className="font-heading flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--k-silk)" }}>
          <Users className="h-4 w-4" style={{ color: "var(--k-muted)" }} />
          Customer Directory ({customerUsers.length})
        </h3>
        <div className="mt-3 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} />
          <input
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="k-input pl-10"
          />
        </div>
        {loading ? (
          <p className="mt-3 text-sm" style={{ color: "var(--k-muted)" }}>Loading…</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "var(--k-muted)" }}>
            {customerSearch.trim() ? "No customers match your search." : "No customers yet."}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--k-line)" }}>
                  <th className="pb-2 pr-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Name</th>
                  <th className="pb-2 pr-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Email</th>
                  <th className="pb-2 pr-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Joined</th>
                  <th className="pb-2 pr-3 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--k-line)" }}>
                    <td className="py-2.5 pr-3" style={{ color: "var(--k-silk)" }}>{u.full_name || "—"}</td>
                    <td className="py-2.5 pr-3" style={{ color: "var(--k-muted)" }}>{u.email}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap" style={{ color: "var(--k-muted)" }}>
                      {u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-bold" style={{ color: "var(--k-gold)" }}>{orderCountFor(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}