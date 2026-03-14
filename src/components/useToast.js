import { useState } from "react";

/**
 * Hook to manage toast notification state.
 *
 * Returns { toasts, showToast, removeToast }
 *
 * showToast(message, type?, duration?)
 *   type:     "success" | "error" | "warning" | "info"   default: "success"
 *   duration: milliseconds before auto-dismiss            default: 4000
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}
