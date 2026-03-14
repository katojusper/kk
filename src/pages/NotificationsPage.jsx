import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  FaBell,
  FaBellSlash,
  FaCheckDouble,
  FaTrash,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

const TYPE_META = {
  success: { icon: FaCheckCircle, color: "#10b981", bg: "#d1fae5" },
  warning: { icon: FaExclamationTriangle, color: "#f59e0b", bg: "#fef3c7" },
  error: { icon: FaTimesCircle, color: "#ef4444", bg: "#fee2e2" },
  info: { icon: FaInfoCircle, color: "#3b82f6", bg: "#dbeafe" },
};

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.info;
}

function timeAgo(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("notifications.justNow");
  if (mins < 60) return `${mins} ${t("notifications.minutesAgo")}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${t("notifications.hoursAgo")}`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ${t("notifications.daysAgo")}`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [user, setUser] = useState(null);

  const filterLabels = {
    all: t("notifications.filterAll"),
    unread: t("notifications.filterUnread"),
    read: t("notifications.filterRead"),
  };

  /* ── fetch ── */
  const fetchNotifications = useCallback(
    async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        let query = supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (filter === "unread") query = query.eq("read", false);
        if (filter === "read") query = query.eq("read", true);

        const { data, error: fetchErr } = await query;

        if (fetchErr) throw fetchErr;
        setNotifications(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message || t("common.unknownError"));
      } finally {
        setLoading(false);
      }
    },
    [filter, t],
  );

  /* ── auth + initial load ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      fetchNotifications(u);
    });
  }, [fetchNotifications]);

  /* ── realtime subscription ── */
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications(user),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, fetchNotifications]);

  /* ── mark one as read ── */
  const markAsRead = async (id) => {
    const { error: err } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (!err) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    }
  };

  /* ── mark all as read ── */
  const markAllAsRead = async () => {
    if (!user) return;
    const { error: err } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    if (!err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  /* ── delete one ── */
  const deleteNotification = async (id) => {
    const { error: err } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
    if (!err) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  /* ── clear all read ── */
  const clearAllRead = async () => {
    if (!user) return;
    const { error: err } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("read", true);
    if (!err) {
      setNotifications((prev) => prev.filter((n) => !n.read));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ── render ── */
  return (
    <div className="rc-page-container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 className="rc-page-title">
            <FaBell style={{ marginRight: "0.5rem", display: "inline" }} />
            {t("notifications.title")}
            {unreadCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "0.6rem",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#fff",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  minWidth: "1.4rem",
                  height: "1.4rem",
                  padding: "0 0.4rem",
                  WebkitTextFillColor: "#fff",
                }}
              >
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="rc-page-subtitle">{t("notifications.subtitle")}</p>
        </div>

        {/* Action buttons */}
        {user && notifications.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
              >
                <FaCheckDouble style={{ color: "#10b981" }} />
                {t("notifications.markAllRead")}
              </button>
            )}
            <button
              type="button"
              onClick={clearAllRead}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                border: "1px solid #fee2e2",
                background: "#fff5f5",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#dc2626",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fee2e2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#fff5f5")
              }
            >
              <FaTrash />
              {t("notifications.clearRead")}
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="rc-pill-toggle" style={{ marginBottom: "1.25rem" }}>
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? "rc-pill-toggle-active" : ""}
            onClick={() => {
              setFilter(f);
              setLoading(true);
            }}
          >
            {filterLabels[f]}
            {f === "unread" && unreadCount > 0 && ` (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Not logged in */}
      {!user && (
        <div
          className="rc-card"
          style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}
        >
          <FaBellSlash
            style={{
              fontSize: "2.5rem",
              color: "#9ca3af",
              marginBottom: "0.75rem",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            {t("notifications.loginPrompt")}
          </p>
        </div>
      )}

      {/* Loading */}
      {user && loading && (
        <p className="rc-hint">{t("notifications.loading")}</p>
      )}

      {/* Error */}
      {user && error && (
        <div
          style={{
            padding: "0.85rem 1rem",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {user && !loading && !error && notifications.length === 0 && (
        <div
          className="rc-card"
          style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}
        >
          <FaBell
            style={{
              fontSize: "2.5rem",
              color: "#9ca3af",
              marginBottom: "0.75rem",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            {filter === "unread"
              ? t("notifications.noUnread")
              : filter === "read"
                ? t("notifications.noRead")
                : t("notifications.noNotifications")}
          </p>
        </div>
      )}

      {/* Notification list */}
      {user && !loading && notifications.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "0.65rem",
          }}
        >
          {notifications.map((notif) => {
            const meta = getTypeMeta(notif.type);
            const Icon = meta.icon;
            return (
              <article
                key={notif.id}
                className="rc-card"
                onClick={() => !notif.read && markAsRead(notif.id)}
                style={{
                  padding: "0.9rem 1.1rem",
                  cursor: notif.read ? "default" : "pointer",
                  background: notif.read
                    ? "rgba(255,255,255,0.95)"
                    : `linear-gradient(135deg, ${meta.bg} 0%, rgba(255,255,255,0.98) 100%)`,
                  borderLeft: `4px solid ${notif.read ? "#e5e7eb" : meta.color}`,
                  display: "flex",
                  gap: "0.85rem",
                  alignItems: "flex-start",
                  transition: "all 0.25s",
                }}
              >
                {/* Type icon */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "2.2rem",
                    height: "2.2rem",
                    borderRadius: "50%",
                    background: meta.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "0.1rem",
                  }}
                >
                  <Icon style={{ color: meta.color, fontSize: "0.95rem" }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="rc-card-title"
                      style={{
                        margin: 0,
                        fontSize: "0.95rem",
                        fontWeight: notif.read ? 500 : 700,
                      }}
                    >
                      {notif.title || t("notifications.title")}
                      {!notif.read && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "0.5rem",
                            height: "0.5rem",
                            borderRadius: "50%",
                            background: meta.color,
                            marginLeft: "0.5rem",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#9ca3af",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {timeAgo(notif.created_at, t)}
                    </span>
                  </div>

                  <p
                    className="rc-card-description"
                    style={{ marginTop: "0.3rem", fontSize: "0.875rem" }}
                  >
                    {notif.message || ""}
                  </p>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    flexShrink: 0,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {!notif.read && (
                    <button
                      type="button"
                      title={t("notifications.markAsRead")}
                      onClick={() => markAsRead(notif.id)}
                      style={{
                        background: "#d1fae5",
                        border: "none",
                        borderRadius: "50%",
                        width: "1.75rem",
                        height: "1.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#065f46",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#a7f3d0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#d1fae5")
                      }
                    >
                      <FaCheckDouble style={{ fontSize: "0.7rem" }} />
                    </button>
                  )}
                  <button
                    type="button"
                    title={t("notifications.delete")}
                    onClick={() => deleteNotification(notif.id)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "50%",
                      width: "1.75rem",
                      height: "1.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#dc2626",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fca5a5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fee2e2")
                    }
                  >
                    <FaTrash style={{ fontSize: "0.7rem" }} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
