import { useEffect, useState } from "react";

import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

/**
 * Individual Toast item
 */
function ToastItem({
  id,
  message,
  type = "success",
  duration = 4000,
  onRemove,
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 350);
  };

  const config = {
    success: {
      icon: FaCheckCircle,
      bg: "#f0fdf4",
      border: "#86efac",
      color: "#166534",
      iconColor: "#16a34a",
      bar: "#22c55e",
    },
    error: {
      icon: FaExclamationCircle,
      bg: "#fef2f2",
      border: "#fca5a5",
      color: "#991b1b",
      iconColor: "#dc2626",
      bar: "#ef4444",
    },
    warning: {
      icon: FaExclamationTriangle,
      bg: "#fffbeb",
      border: "#fcd34d",
      color: "#92400e",
      iconColor: "#d97706",
      bar: "#f59e0b",
    },
    info: {
      icon: FaInfoCircle,
      bg: "#eff6ff",
      border: "#93c5fd",
      color: "#1e40af",
      iconColor: "#2563eb",
      bar: "#3b82f6",
    },
  };

  const c = config[type] || config.info;
  const Icon = c.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.875rem 1rem",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "0.75rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 6px rgba(0,0,0,0.08)",
        maxWidth: "360px",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        transform:
          visible && !leaving
            ? "translateX(0) scale(1)"
            : "translateX(100%) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {/* Coloured left bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: c.bar,
          borderRadius: "0.75rem 0 0 0.75rem",
        }}
      />

      {/* Icon */}
      <div style={{ flexShrink: 0, paddingTop: "1px" }}>
        <Icon style={{ fontSize: "1.1rem", color: c.iconColor }} />
      </div>

      {/* Message */}
      <div
        style={{
          flex: 1,
          fontSize: "0.875rem",
          color: c.color,
          fontWeight: 500,
          lineHeight: 1.45,
          whiteSpace: "pre-line",
          paddingLeft: "4px",
        }}
      >
        {message}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          flexShrink: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px",
          color: c.color,
          opacity: 0.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
        aria-label="Dismiss notification"
      >
        <FaTimes style={{ fontSize: "0.75rem" }} />
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `${c.bar}33`,
          borderRadius: "0 0 0.75rem 0.75rem",
        }}
      >
        <div
          style={{
            height: "100%",
            background: c.bar,
            borderRadius: "inherit",
            animation: `toast-shrink ${duration}ms linear forwards`,
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Toast container — renders a stack of toasts in the top-right corner.
 * Pass `toasts` array and `removeToast` callback.
 *
 * Usage:
 *   const { toasts, showToast, removeToast } = useToast();
 *   <ToastContainer toasts={toasts} removeToast={removeToast} />
 *
 *   showToast("Saved!", "success");
 *   showToast("Something went wrong", "error");
 */
export function ToastContainer({ toasts = [], removeToast }) {
  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          pointerEvents: "none",
          alignItems: "flex-end",
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <ToastItem
              id={t.id}
              message={t.message}
              type={t.type}
              duration={t.duration || 4000}
              onRemove={removeToast}
            />
          </div>
        ))}
      </div>
    </>
  );
}
