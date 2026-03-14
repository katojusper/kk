import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getDemoUser } from "../lib/supabaseClient.js";
import {
  FaUsers,
  FaUserShield,
  FaClipboardList,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartBar,
  FaFileAlt,
  FaMapMarkerAlt,
  FaBell,
  FaCog,
  FaTrash,
  FaDatabase,
  FaTachometerAlt,
  FaUserPlus,
  FaDownload,
  FaEnvelope,
  FaShieldAlt,
  FaToggleOn,
  FaToggleOff,
  FaCrown,
  FaHistory,
} from "react-icons/fa";

/**
 * Utility helpers (defensive)
 */
function safeNumber(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(val) {
  const n = safeNumber(val);
  try {
    return n.toLocaleString();
  } catch {
    return String(n);
  }
}

function formatDateSafe(d) {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  } catch {
    return "—";
  }
}

/* StatCard with defensive rendering */
function StatCard({
  icon: IconComp,
  label,
  value,
  sub,
  gradient,
  onClick,
  live,
}) {
  const Icon = IconComp;
  const [bumped, setBumped] = useState(false);
  const prevVal = useRef(safeNumber(value));

  useEffect(() => {
    const curr = safeNumber(value);
    if (prevVal.current !== curr && prevVal.current !== undefined) {
      // schedule bump asynchronously to avoid synchronous setState inside effect
      const start = setTimeout(() => setBumped(true), 0);
      const stop = setTimeout(() => setBumped(false), 700);
      return () => {
        clearTimeout(start);
        clearTimeout(stop);
      };
    }
    prevVal.current = curr;
  }, [value]);

  return (
    <div
      onClick={onClick}
      style={{
        background: gradient || "#333",
        borderRadius: "1.1rem",
        padding: "1.25rem 1.4rem",
        color: "#fff",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.22s, box-shadow 0.22s",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.18)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.13)";
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -18,
          top: -18,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.10)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "0.65rem",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "0.65rem",
            background: "rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ fontSize: "1.15rem" }} />
        </div>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, opacity: 0.92 }}>
          {label}
        </div>
      </div>

      <div
        style={{
          fontSize: "2.1rem",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          transition: "transform 0.3s",
          transform: bumped ? "scale(1.08)" : "scale(1)",
          color: bumped ? "#fef08a" : "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {formatNumber(value)}
      </div>

      {sub && (
        <p
          style={{
            color: "rgba(255,255,255,0.82)",
            marginTop: "0.45rem",
            fontSize: "0.73rem",
            fontWeight: 500,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ActionCard - defensive */
function ActionCard({ icon: IconComp, title, desc, color, onClick, badge }) {
  const Icon = IconComp;
  const safeBadge = safeNumber(badge);
  return (
    <button
      type="button"
      onClick={() => {
        try {
          onClick && onClick();
        } catch (e) {
          // swallow — UI shouldn't crash because of action handler
          console.error("ActionCard handler error:", e);
        }
      }}
      style={{
        position: "relative",
        textAlign: "left",
        cursor: "pointer",
        background: "#fff",
        border: `1.5px solid ${color || "#111"}22`,
        borderRadius: "1rem",
        padding: "1.1rem 1.15rem",
        transition: "all 0.2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "0.45rem",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {safeBadge > 0 && (
        <span
          style={{
            position: "absolute",
            top: "0.55rem",
            right: "0.55rem",
            background: "#ef4444",
            color: "#fff",
            fontSize: "0.62rem",
            fontWeight: 800,
            borderRadius: "999px",
            padding: "0.15rem 0.45rem",
            minWidth: "1.3rem",
            textAlign: "center",
          }}
        >
          {safeBadge}
        </span>
      )}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "0.7rem",
          background: `linear-gradient(135deg, ${color || "#000"}22 0%, ${
            color || "#000"
          }44 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon style={{ color: color || "#111", fontSize: "1.1rem" }} />
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1f2937" }}>
        {title}
      </div>
      <p
        style={{
          fontSize: "0.73rem",
          color: "#6b7280",
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {desc}
      </p>
    </button>
  );
}

/* Broadcast modal (unchanged behavior but safe) */
function BroadcastModal({ onClose, onSend }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await onSend(title.trim(), message.trim(), type);
    } catch (err) {
      console.error("Broadcast send error:", err);
    } finally {
      setSending(false);
      onClose && onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "1rem",
      }}
    >
      <div
        className="rc-auth-card"
        style={{ maxWidth: 480, width: "100%", padding: "1.75rem" }}
      >
        <h3
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaBell style={{ color: "#667eea" }} /> Broadcast Notification
        </h3>
        <label className="rc-field-label">
          Title
          <input
            className="rc-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
          />
        </label>
        <label className="rc-field-label">
          Message
          <textarea
            className="rc-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Notification message…"
            rows={3}
            style={{
              marginTop: "0.25rem",
              width: "100%",
              padding: "0.65rem",
              borderRadius: "0.75rem",
              border: "1.5px solid #e5e7eb",
              fontSize: "0.875rem",
              resize: "vertical",
            }}
          />
        </label>
        <label className="rc-field-label">
          Type
          <select
            className="rc-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ marginTop: "0.25rem" }}
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Alert / Emergency</option>
          </select>
        </label>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button
            type="button"
            className="rc-primary-button"
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
          >
            {sending ? "Sending…" : "Send to All Users"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* System panel safe */
function SettingRow({
  label,
  desc,
  settingKey,
  type = "toggle",
  min,
  max,
  settings = {},
  onToggle = () => {},
  onChange = () => {},
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <div>
        <div
          style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "0.15rem",
          }}
        >
          {desc}
        </div>
      </div>
      {type === "toggle" ? (
        <button
          type="button"
          onClick={() => onToggle(settingKey)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.5rem",
            color: settings[settingKey] ? "#10b981" : "#d1d5db",
          }}
        >
          {settings[settingKey] ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      ) : (
        <input
          type="number"
          min={min}
          max={max}
          value={settings[settingKey]}
          onChange={(e) => onChange(settingKey, +e.target.value)}
          style={{
            width: 80,
            padding: "0.35rem 0.6rem",
            borderRadius: "0.5rem",
            border: "1.5px solid #e5e7eb",
            fontSize: "0.875rem",
          }}
        />
      )}
    </div>
  );
}

function SystemPanel({ onClose }) {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    maxReportsPerUser: 50,
    autoArchiveDays: 90,
  });

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  const handleChange = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "1rem",
      }}
    >
      <div
        className="rc-auth-card"
        style={{
          maxWidth: 520,
          width: "100%",
          padding: "1.75rem",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <h3
          style={{
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaCog style={{ color: "#667eea" }} /> System Settings
        </h3>
        <SettingRow
          label="Maintenance Mode"
          desc="Disable new submissions while maintenance is ongoing"
          settingKey="maintenanceMode"
          settings={settings}
          onToggle={toggle}
          onChange={handleChange}
        />
        <SettingRow
          label="Allow New Registrations"
          desc="Allow new users to sign up"
          settingKey="allowRegistrations"
          settings={settings}
          onToggle={toggle}
          onChange={handleChange}
        />
        <SettingRow
          label="Require Email Verification"
          desc="Users must verify email before accessing the app"
          settingKey="requireEmailVerification"
          settings={settings}
          onToggle={toggle}
          onChange={handleChange}
        />
        <SettingRow
          label="Max Reports Per User"
          desc="Maximum number of active reports a user can have"
          settingKey="maxReportsPerUser"
          type="number"
          min={1}
          max={500}
          settings={settings}
          onToggle={toggle}
          onChange={handleChange}
        />
        <SettingRow
          label="Auto-Archive After (days)"
          desc="Automatically archive resolved reports after N days"
          settingKey="autoArchiveDays"
          type="number"
          min={7}
          max={365}
          settings={settings}
          onToggle={toggle}
          onChange={handleChange}
        />

        <div
          style={{
            marginTop: "1.5rem",
            padding: "0.85rem",
            background: "#fef3c7",
            borderRadius: "0.75rem",
            border: "1px solid #fde68a",
            fontSize: "0.8rem",
            color: "#92400e",
          }}
        >
          <FaExclamationTriangle
            style={{ marginRight: "0.35rem", display: "inline" }}
          />
          Settings are stored locally in this session. Connect your Supabase
          remote config table to persist them.
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button type="button" className="rc-primary-button" onClick={onClose}>
            Save & Close
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* Main Admin Dashboard - defensive and safe user handling */
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    resolvedRequests: 0,
    totalAdmins: 0,
    totalReports: 0,
    rejectedRequests: 0,
    missingPersons: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showSystem, setShowSystem] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [toast, setToast] = useState(null);
  const channelRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(
    async () => {
      setLoading(true);
      try {
        const demo = getDemoUser();
        let reports = [];
        let users = [];
        // Defensive wrappers for Promise.all: some operations may fail
        const safeCount = async (op) => {
          try {
            const res = await op;
            // supabase head count returns { count } OR might return an array; handle both
            if (!res) return 0;
            if (typeof res.count === "number") return res.count;
            if (Array.isArray(res)) return res.length;
            return 0;
          } catch (e) {
            console.error("safeCount op failed:", e);
            return 0;
          }
        };

        // Prepare queries but do them defensively
        const counts = await Promise.all([
          safeCount(
            supabase
              .from("user_profiles")
              .select("*", { count: "exact", head: true }),
          ),
          safeCount(
            supabase
              .from("user_profiles")
              .select("*", { count: "exact", head: true })
              .eq("is_active", true),
          ),
          safeCount(
            supabase
              .from("crime_reports")
              .select("*", { count: "exact", head: true })
              .eq("status", "pending"),
          ),
          safeCount(
            supabase
              .from("crime_reports")
              .select("*", { count: "exact", head: true })
              .eq("status", "resolved"),
          ),
          safeCount(
            supabase
              .from("crime_reports")
              .select("*", { count: "exact", head: true })
              .eq("status", "rejected"),
          ),
          safeCount(
            supabase
              .from("admin_users")
              .select("*", { count: "exact", head: true }),
          ),
          safeCount(
            supabase
              .from("crime_reports")
              .select("*", { count: "exact", head: true }),
          ),
          safeCount(
            supabase
              .from("missing_persons")
              .select("*", { count: "exact", head: true })
              .eq("status", "active"),
          ),
        ]);

        setStats({
          totalUsers: counts[0] || 0,
          activeUsers: counts[1] || 0,
          pendingRequests: counts[2] || 0,
          resolvedRequests: counts[3] || 0,
          rejectedRequests: counts[4] || 0,
          totalAdmins: counts[5] || 0,
          totalReports: counts[6] || 0,
          missingPersons: counts[7] || 0,
        });

        // Recent reports (defensive)
        try {
          const { data: repData } = await supabase
            .from("crime_reports")
            .select("id, category, location, status, created_at, user_id")
            .order("created_at", { ascending: false })
            .limit(5);
          reports = Array.isArray(repData) ? repData : [];
          setRecentReports(reports);
        } catch (e) {
          console.error("Failed to fetch recent reports:", e);
          reports = [];
          setRecentReports([]);
        }

        // Recent users (defensive)
        try {
          const { data: userData } = await supabase
            .from("user_profiles")
            .select(
              "user_id, email, full_name, username, is_active, created_at",
            )
            .order("created_at", { ascending: false })
            .limit(5);
          users = Array.isArray(userData) ? userData : [];
          setRecentUsers(users);
        } catch (e) {
          console.error("Failed to fetch recent users:", e);
          users = [];
          setRecentUsers([]);
        }

        // Admin info: safe handling
        try {
          // supabase.auth.getUser() may fail or return undefined; handle both
          const authRes = await supabase.auth.getUser().catch((e) => {
            console.warn("getUser failed:", e?.message || e);
            return null;
          });

          const userFromAuth = authRes?.data?.user ?? null;
          const currentUser = demo || userFromAuth;
          if (currentUser) {
            const adminQuery = await supabase
              .from("admin_users")
              .select("*")
              .eq("user_id", currentUser.id)
              .maybeSingle()
              .catch(() => ({ data: null }));
            const adminRecord = adminQuery?.data ?? null;
            setAdminInfo(
              adminRecord ||
                (demo
                  ? { email: currentUser.email, role: "super_admin" }
                  : null),
            );
          } else {
            // No user — ensure adminInfo is null
            setAdminInfo(null);
          }
        } catch (e) {
          console.error("Admin info fetch error:", e);
          if (getDemoUser()) {
            setAdminInfo({ email: getDemoUser().email, role: "super_admin" });
          } else {
            setAdminInfo(null);
          }
        }

        // Build activity log from fetched reports/users (defensive)
        const log = [];
        if (Array.isArray(reports) && reports.length > 0) {
          reports.slice(0, 3).forEach((r) =>
            log.push({
              icon: FaExclamationTriangle,
              color: "#f59e0b",
              text: `New crime report: ${r?.category || "Unknown"} in ${r?.location || "Unknown"}`,
              time: r?.created_at || new Date().toISOString(),
            }),
          );
        }
        if (Array.isArray(users) && users.length > 0) {
          users.slice(0, 2).forEach((u) =>
            log.push({
              icon: FaUserPlus,
              color: "#10b981",
              text: `New user registered: ${u?.email || u?.full_name || "Unknown"}`,
              time: u?.created_at || new Date().toISOString(),
            }),
          );
        }
        // If log still empty, add a small placeholder item only in demo mode
        if (log.length === 0 && getDemoUser()) {
          log.push({
            icon: FaCrown,
            color: "#f59e0b",
            text: `Demo mode active`,
            time: new Date().toISOString(),
          });
        }
        log.sort((a, b) => new Date(b.time) - new Date(a.time));
        setActivityLog(log);
      } catch (err) {
        console.error("AdminDashboard fetch error (outer):", err);
        // Demo fallback
        if (getDemoUser()) {
          setStats((s) => ({
            ...s,
            totalAdmins: Math.max(1, s.totalAdmins || 0),
          }));
          setAdminInfo(
            (ai) => ai || { email: getDemoUser().email, role: "super_admin" },
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      /* no deps other than stable refs */
    ],
  );

  useEffect(() => {
    // initial load
    fetchData();
    // we intentionally do not add fetchData to deps to avoid accidental re-runs;
    // fetchData is stable due to useCallback and no external dynamic deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription with defensive guards
  useEffect(() => {
    if (channelRef.current) return;

    try {
      const channel = supabase
        .channel("admin-dashboard-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "crime_reports" },
          (payload) => {
            try {
              const newReport = payload?.new ?? null;
              setStats((prev) => ({
                ...prev,
                totalReports:
                  safeNumber(prev.totalReports) + (newReport ? 1 : 0),
                pendingRequests:
                  newReport?.status === "pending"
                    ? safeNumber(prev.pendingRequests) + 1
                    : safeNumber(prev.pendingRequests),
              }));
              if (newReport) {
                setRecentReports((prev) =>
                  [newReport, ...(Array.isArray(prev) ? prev : [])].slice(0, 5),
                );
                setActivityLog((prev) =>
                  [
                    {
                      icon: FaExclamationTriangle,
                      color: "#f59e0b",
                      text: `New crime report: ${newReport?.category || "Unknown"} in ${newReport?.location || "Unknown"}`,
                      time: newReport?.created_at || new Date().toISOString(),
                    },
                    ...(Array.isArray(prev) ? prev : []),
                  ].slice(0, 10),
                );
                showToast("📋 New crime report submitted!", "success");
              }
            } catch (e) {
              console.error("Realtime INSERT handler error:", e);
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "crime_reports" },
          () => {
            // Re-fetch counts when a report status changes
            fetchData();
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "user_profiles" },
          (payload) => {
            try {
              const newUser = payload?.new ?? null;
              setStats((prev) => ({
                ...prev,
                totalUsers: safeNumber(prev.totalUsers) + (newUser ? 1 : 0),
                activeUsers:
                  safeNumber(prev.activeUsers) + (newUser?.is_active ? 1 : 0),
              }));
              if (newUser) {
                setRecentUsers((prev) =>
                  [newUser, ...(Array.isArray(prev) ? prev : [])].slice(0, 5),
                );
                showToast("👤 New user registered!", "success");
              }
            } catch (e) {
              console.error("Realtime user INSERT handler error:", e);
            }
          },
        );

      channel.subscribe().catch((err) => {
        console.error("Realtime subscribe error:", err);
      });

      channelRef.current = channel;
    } catch (e) {
      console.error("Failed to setup realtime channel:", e);
    }

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (e) {
          console.error("Failed to remove realtime channel:", e);
        } finally {
          channelRef.current = null;
        }
      }
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => showToast("Dashboard refreshed"));
  };

  const handleBroadcast = async (title, message, type) => {
    try {
      const { data: users } = await supabase
        .from("user_profiles")
        .select("user_id")
        .catch(() => ({ data: [] }));
      if (!Array.isArray(users) || users.length === 0) {
        showToast("No users found", "error");
        return;
      }
      const rows = users.map((u) => ({
        user_id: u?.user_id,
        title,
        message,
        type,
      }));
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        await supabase
          .from("notifications")
          .insert(rows.slice(i, i + batchSize))
          .catch((e) => {
            console.error("notification insert batch error:", e);
          });
      }
      showToast(`Notification sent to ${rows.length} user(s)!`);
    } catch (err) {
      console.error("handleBroadcast error:", err);
      showToast(err?.message || "Failed to broadcast", "error");
    }
  };

  const handleQuickApprove = async (reportId) => {
    if (!reportId) {
      showToast("Invalid report id", "error");
      return;
    }
    try {
      const authRes = await supabase.auth.getUser().catch(() => null);
      const reviewer = getDemoUser() || authRes?.data?.user || null;
      const reviewerId = reviewer?.id ?? null;
      await supabase
        .from("crime_reports")
        .update({
          status: "resolved",
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId)
        .catch((e) => {
          throw e;
        });
      showToast("Report approved successfully");
      fetchData();
    } catch (err) {
      console.error("approve error:", err);
      showToast(err?.message || "Failed to approve", "error");
    }
  };

  const handleToggleUserActive = async (userId, currentStatus) => {
    if (!userId) {
      showToast("Invalid user id", "error");
      return;
    }
    try {
      await supabase
        .from("user_profiles")
        .update({ is_active: !currentStatus })
        .eq("user_id", userId)
        .catch((e) => {
          throw e;
        });
      showToast(
        `User ${currentStatus ? "deactivated" : "activated"} successfully`,
      );
      fetchData();
    } catch (err) {
      console.error("toggle user active error:", err);
      showToast(err?.message || "Failed to update user", "error");
    }
  };

  const resolveRate =
    stats?.totalReports > 0
      ? Math.round(
          (safeNumber(stats.resolvedRequests) /
            safeNumber(stats.totalReports)) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <div
        className="rc-page-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: "1rem",
        }}
      >
        <div className="rc-splash-loader" />
        <p className="rc-hint">Loading admin dashboard…</p>
      </div>
    );
  }

  return (
    <div className="rc-page-container">
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 100,
            padding: "0.75rem 1.25rem",
            borderRadius: "0.75rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            maxWidth: 320,
            background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
            color: toast.type === "error" ? "#dc2626" : "#065f46",
            border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#6ee7b7"}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {showBroadcast && (
        <BroadcastModal
          onClose={() => setShowBroadcast(false)}
          onSend={handleBroadcast}
        />
      )}
      {showSystem && <SystemPanel onClose={() => setShowSystem(false)} />}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2
            className="rc-page-title"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FaUserShield style={{ color: "#667eea" }} />
            Admin Dashboard
            {adminInfo?.role === "super_admin" && (
              <span
                style={{
                  fontSize: "0.7rem",
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#fff",
                  borderRadius: "999px",
                  padding: "0.15rem 0.55rem",
                  fontWeight: 700,
                }}
              >
                <FaCrown
                  style={{ marginRight: "0.25rem", fontSize: "0.65rem" }}
                />{" "}
                Super Admin
              </span>
            )}
          </h2>
          <p className="rc-page-subtitle">
            Full control over users, reports, and system operations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1.1rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <FaTachometerAlt />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => setShowBroadcast(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1.1rem",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <FaBell /> Broadcast
          </button>

          <button
            type="button"
            onClick={() => setShowSystem(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1.1rem",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <FaCog /> System
          </button>
        </div>
      </div>

      <div className="rc-card-grid" style={{ marginBottom: "2rem" }}>
        <StatCard
          icon={FaUsers}
          label="Total Users"
          value={stats.totalUsers}
          sub={`${safeNumber(stats.activeUsers)} active`}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          onClick={() => navigate("/admin/manage-users")}
        />
        <StatCard
          icon={FaExclamationTriangle}
          label="Pending Reports"
          value={stats.pendingRequests}
          sub="Awaiting review"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          onClick={() => navigate("/admin/pending-requests")}
        />
        <StatCard
          icon={FaCheckCircle}
          label="Resolved"
          value={stats.resolvedRequests}
          sub={`${resolveRate}% resolve rate`}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          onClick={() => navigate("/admin/uploads")}
        />
        <StatCard
          icon={FaChartBar}
          label="Total Reports"
          value={stats.totalReports}
          sub="All time"
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          onClick={() => navigate("/admin/uploads")}
        />
        <StatCard
          icon={FaUserShield}
          label="Admins"
          value={stats.totalAdmins}
          sub="System admins"
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          onClick={() => navigate("/admin/manage-admins")}
        />
        <StatCard
          icon={FaMapMarkerAlt}
          label="Missing Persons"
          value={stats.missingPersons}
          sub="Active cases"
          gradient="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
          onClick={() => navigate("/admin/pending-requests")}
        />
      </div>

      <div
        className="rc-card"
        style={{ marginBottom: "2rem", padding: "1.25rem 1.5rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.6rem",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            📊 Report Resolution Rate
          </span>
          <span
            style={{ fontWeight: 800, fontSize: "1.1rem", color: "#10b981" }}
          >
            {resolveRate}%
          </span>
        </div>
        <div
          style={{
            background: "#e5e7eb",
            borderRadius: "999px",
            height: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${resolveRate}%`,
              height: "100%",
              background: "linear-gradient(90deg, #43e97b, #38f9d7)",
              borderRadius: "999px",
              transition: "width 1s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          <span>Pending: {safeNumber(stats.pendingRequests)}</span>
          <span>Resolved: {safeNumber(stats.resolvedRequests)}</span>
          <span>Rejected: {safeNumber(stats.rejectedRequests)}</span>
        </div>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <FaTachometerAlt style={{ color: "#667eea" }} /> Quick Actions
        </h3>
        <div className="rc-card-grid">
          <ActionCard
            icon={FaUsers}
            title="Manage Users"
            desc="View, activate, deactivate, or remove users"
            color="#667eea"
            onClick={() => navigate("/admin/manage-users")}
            badge={stats.totalUsers}
          />
          <ActionCard
            icon={FaUserShield}
            title="Manage Admins"
            desc="Add or remove admin accounts"
            color="#764ba2"
            onClick={() => navigate("/admin/manage-admins")}
          />
          <ActionCard
            icon={FaClipboardList}
            title="Pending Requests"
            desc="Review and respond to reports"
            color="#f5576c"
            onClick={() => navigate("/admin/pending-requests")}
            badge={stats.pendingRequests}
          />
          <ActionCard
            icon={FaFileAlt}
            title="All Reports"
            desc="View all submitted reports"
            color="#4facfe"
            onClick={() => navigate("/admin/uploads")}
            badge={stats.totalReports}
          />
          <ActionCard
            icon={FaBell}
            title="Send Notification"
            desc="Broadcast a message to all users"
            color="#f093fb"
            onClick={() => setShowBroadcast(true)}
          />
          <ActionCard
            icon={FaMapMarkerAlt}
            title="Police Stations Map"
            desc="View and filter station locations"
            color="#10b981"
            onClick={() => navigate("/search-stations")}
          />
          <ActionCard
            icon={FaCog}
            title="System Settings"
            desc="Configure platform behaviour"
            color="#6b7280"
            onClick={() => setShowSystem(true)}
          />
          <ActionCard
            icon={FaDatabase}
            title="Reports Archive"
            desc="Browse all historical records"
            color="#a18cd1"
            onClick={() => navigate("/admin/uploads")}
          />
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <FaExclamationTriangle style={{ color: "#f5576c" }} /> Recent
              Reports
            </h3>
            <button
              type="button"
              onClick={() => navigate("/admin/pending-requests")}
              style={{
                background: "none",
                border: "none",
                color: "#667eea",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              View all →
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {!Array.isArray(recentReports) || recentReports.length === 0 ? (
              <p className="rc-hint">No reports yet.</p>
            ) : (
              recentReports.map((report) => {
                const id = report?.id ?? Math.random().toString(36).slice(2, 9);
                const status = report?.status ?? "unknown";
                return (
                  <div
                    key={id}
                    className="rc-card"
                    style={{ padding: "0.85rem 1rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {report?.category || "Unknown Category"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            marginTop: "0.2rem",
                          }}
                        >
                          📍 {report?.location || "Location not specified"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#9ca3af",
                            marginTop: "0.15rem",
                          }}
                        >
                          {formatDateSafe(report?.created_at)}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.35rem",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "999px",
                            whiteSpace: "nowrap",
                            background:
                              status === "pending"
                                ? "#fef3c7"
                                : status === "resolved"
                                  ? "#d1fae5"
                                  : "#fee2e2",
                            color:
                              status === "pending"
                                ? "#92400e"
                                : status === "resolved"
                                  ? "#065f46"
                                  : "#dc2626",
                          }}
                        >
                          {status}
                        </span>

                        {status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleQuickApprove(report?.id)}
                            style={{
                              fontSize: "0.7rem",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "999px",
                              border: "none",
                              background: "#d1fae5",
                              color: "#065f46",
                              cursor: "pointer",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ✓ Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <FaUsers style={{ color: "#667eea" }} /> Recent Users
            </h3>
            <button
              type="button"
              onClick={() => navigate("/admin/manage-users")}
              style={{
                background: "none",
                border: "none",
                color: "#667eea",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              View all →
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {!Array.isArray(recentUsers) || recentUsers.length === 0 ? (
              <p className="rc-hint">No users yet.</p>
            ) : (
              recentUsers.map((u) => {
                const uid =
                  u?.user_id ?? u?.id ?? Math.random().toString(36).slice(2, 9);
                const isActive = !!u?.is_active;
                const displayName =
                  u?.full_name || u?.username || u?.email || "Unnamed";
                return (
                  <div
                    key={uid}
                    className="rc-card"
                    style={{
                      padding: "0.85rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: isActive
                            ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                            : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isActive ? "#fff" : "#6b7280",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {String((displayName || "U").charAt(0)).toUpperCase()}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "#6b7280",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u?.email || "—"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          padding: "0.18rem 0.45rem",
                          borderRadius: "999px",
                          background: isActive ? "#d1fae5" : "#fee2e2",
                          color: isActive ? "#065f46" : "#dc2626",
                        }}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleUserActive(u?.user_id ?? u?.id, isActive)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                          color: isActive ? "#10b981" : "#d1d5db",
                        }}
                        title={isActive ? "Deactivate user" : "Activate user"}
                      >
                        {isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <FaHistory style={{ color: "#667eea" }} /> Recent Activity
        </h3>
        <div className="rc-card" style={{ padding: "1rem 1.25rem" }}>
          {!Array.isArray(activityLog) || activityLog.length === 0 ? (
            <p className="rc-hint">No recent activity.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {activityLog.map((item, idx) => {
                const Icon = item?.icon || FaHistory;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.5rem 0",
                      borderBottom:
                        idx < activityLog.length - 1
                          ? "1px solid #f3f4f6"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: `${item?.color || "#ddd"}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        style={{
                          color: item?.color || "#666",
                          fontSize: "0.8rem",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.875rem", color: "#374151" }}>
                        {item?.text || "Activity"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "#9ca3af",
                          marginTop: "0.15rem",
                        }}
                      >
                        {formatDateSafe(item?.time)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <FaShieldAlt style={{ color: "#f59e0b" }} /> Admin Rights &
          Permissions
        </h3>

        <div className="rc-card" style={{ padding: "1.25rem 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[
              {
                icon: FaUsers,
                label: "Manage Users",
                desc: "View, activate, deactivate all users",
                granted: true,
              },
              {
                icon: FaUserShield,
                label: "Manage Admins",
                desc: "Add or remove admin accounts",
                granted: adminInfo?.role === "super_admin",
              },
              {
                icon: FaClipboardList,
                label: "Review Reports",
                desc: "Approve or reject crime reports",
                granted: true,
              },
              {
                icon: FaBell,
                label: "Send Notifications",
                desc: "Broadcast messages to users",
                granted: true,
              },
              {
                icon: FaFileAlt,
                label: "View All Data",
                desc: "Access all user submissions",
                granted: true,
              },
              {
                icon: FaTrash,
                label: "Delete Records",
                desc: "Permanently remove records",
                granted: adminInfo?.role === "super_admin",
              },
              {
                icon: FaUserPlus,
                label: "Create Admins",
                desc: "Promote users to admin role",
                granted: adminInfo?.role === "super_admin",
              },
              {
                icon: FaCog,
                label: "System Config",
                desc: "Change platform settings",
                granted: adminInfo?.role === "super_admin",
              },
              {
                icon: FaDatabase,
                label: "Database Access",
                desc: "Read all database records",
                granted: true,
              },
              {
                icon: FaDownload,
                label: "Export Data",
                desc: "Download reports and user data",
                granted: true,
              },
              {
                icon: FaEnvelope,
                label: "Email Users",
                desc: "Send emails to registered users",
                granted: adminInfo?.role === "super_admin",
              },
              {
                icon: FaShieldAlt,
                label: "Security Controls",
                desc: "Lock/unlock accounts",
                granted: true,
              },
            ].map((perm, i) => {
              const Icon = perm.icon;
              const granted = !!perm.granted;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    background: granted
                      ? "rgba(16,185,129,0.06)"
                      : "rgba(239,68,68,0.05)",
                    border: `1px solid ${granted ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)"}`,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "0.5rem",
                      background: granted ? "#d1fae5" : "#fee2e2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      style={{
                        color: granted ? "#059669" : "#dc2626",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      {perm.label}
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: granted ? "#059669" : "#dc2626",
                        }}
                      >
                        {granted ? "✓" : "✗"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#6b7280",
                        marginTop: "0.1rem",
                      }}
                    >
                      {perm.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {adminInfo?.role === "super_admin" && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(245,158,11,0.25)",
                fontSize: "0.8rem",
                color: "#92400e",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FaCrown style={{ color: "#f59e0b", flexShrink: 0 }} />
              You have <strong>Super Admin</strong> privileges — full
              unrestricted access to all platform controls.
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default AdminDashboardPage;
