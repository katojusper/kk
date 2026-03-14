import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaCopy, FaTools } from "react-icons/fa";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

export function OAuthDiagnostic({ onClose }) {
  const [diagnostics, setDiagnostics] = useState({
    supabaseUrl: null,
    anonKeyPresent: null,
    supabaseConnection: null,
    currentOrigin: null,
    expectedRedirect: null,
    sessionExists: null,
    googleEnabled: null,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    setLoading(true);
    const results = {};

    // Check Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://oxjwrmxmhuegjcvrctvp.supabase.co";
    results.supabaseUrl = {
      status: supabaseUrl ? "success" : "error",
      value: supabaseUrl,
      message: supabaseUrl ? "Supabase URL configured" : "Missing VITE_SUPABASE_URL",
    };

    // Check Anon Key
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
    results.anonKeyPresent = {
      status: isSupabaseConfigured ? "success" : "error",
      value: anonKey ? `${anonKey.substring(0, 20)}...` : "Not set",
      message: isSupabaseConfigured
        ? "Anon key configured correctly"
        : "VITE_SUPABASE_ANON_KEY missing or invalid in .env file",
    };

    // Check Supabase Connection
    try {
      const { data, error } = await supabase.auth.getSession();
      results.supabaseConnection = {
        status: error ? "error" : "success",
        value: error ? "Failed" : "Connected",
        message: error ? `Connection error: ${error.message}` : "Successfully connected to Supabase",
      };
      results.sessionExists = {
        status: data?.session ? "success" : "warning",
        value: data?.session ? "Active" : "None",
        message: data?.session ? `Logged in as: ${data.session.user.email}` : "No active session",
      };
    } catch (err) {
      results.supabaseConnection = {
        status: "error",
        value: "Failed",
        message: `Connection error: ${err.message}`,
      };
      results.sessionExists = {
        status: "error",
        value: "Unknown",
        message: "Cannot check session due to connection error",
      };
    }

    // Check Current Origin
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "unknown";
    results.currentOrigin = {
      status: "info",
      value: currentOrigin,
      message: "Your current application URL",
    };

    // Expected Redirect URL
    const expectedRedirect = `${currentOrigin}/auth/callback`;
    results.expectedRedirect = {
      status: "info",
      value: expectedRedirect,
      message: "This should be configured in Google Cloud Console",
    };

    // Check if Google OAuth might be enabled (we can't directly check this)
    results.googleEnabled = {
      status: "warning",
      value: "Unknown",
      message: "Cannot verify if Google provider is enabled in Supabase Dashboard. Check manually.",
    };

    setDiagnostics(results);
    setLoading(false);
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  function getStatusIcon(status) {
    switch (status) {
      case "success":
        return <FaCheckCircle style={{ color: "#10b981" }} />;
      case "error":
        return <FaTimesCircle style={{ color: "#ef4444" }} />;
      case "warning":
        return <FaInfoCircle style={{ color: "#f59e0b" }} />;
      default:
        return <FaInfoCircle style={{ color: "#6b7280" }} />;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FaTools style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
              OAuth Configuration Diagnostics
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0.25rem",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="rc-splash-loader" />
              <p style={{ marginTop: "1rem", color: "#6b7280" }}>Running diagnostics...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Diagnostic Items */}
              {Object.entries(diagnostics).map(([key, result]) => (
                <div
                  key={key}
                  style={{
                    padding: "1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    background: result.status === "error" ? "#fef2f2" : result.status === "success" ? "#f0fdf4" : "#fffbeb",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{ fontSize: "1.25rem", marginTop: "0.125rem" }}>
                      {getStatusIcon(result.status)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <strong style={{ fontSize: "0.875rem", textTransform: "capitalize" }}>
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </strong>
                        {result.value && result.value.length > 30 && (
                          <button
                            onClick={() => copyToClipboard(result.value, key)}
                            style={{
                              background: "none",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                              padding: "2px 6px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            title="Copy to clipboard"
                          >
                            <FaCopy size={10} />
                            {copied === key ? "Copied!" : "Copy"}
                          </button>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#374151",
                          fontFamily: "monospace",
                          background: "rgba(0,0,0,0.05)",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          marginBottom: "0.5rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {result.value}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6b7280" }}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Configuration Steps */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                }}
              >
                <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.9375rem", fontWeight: "600" }}>
                  🔧 Required Google Cloud Console Configuration:
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div>
                    <strong>1. Authorized JavaScript Origins:</strong>
                    <div
                      style={{
                        background: "white",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "0.8125rem",
                        marginTop: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{diagnostics.currentOrigin?.value}</span>
                      <button
                        onClick={() => copyToClipboard(diagnostics.currentOrigin?.value, "origin")}
                        style={{
                          background: "none",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                      >
                        <FaCopy size={10} style={{ marginRight: "4px" }} />
                        {copied === "origin" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <strong>2. Authorized Redirect URIs:</strong>
                    <div
                      style={{
                        background: "white",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "0.8125rem",
                        marginTop: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>https://oxjwrmxmhuegjcvrctvp.supabase.co/auth/v1/callback</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            "https://oxjwrmxmhuegjcvrctvp.supabase.co/auth/v1/callback",
                            "redirect"
                          )
                        }
                        style={{
                          background: "none",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                      >
                        <FaCopy size={10} style={{ marginRight: "4px" }} />
                        {copied === "redirect" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#dbeafe", borderRadius: "6px" }}>
                  <strong style={{ color: "#1e40af" }}>📌 Quick Fix:</strong>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#1e40af", lineHeight: 1.5 }}>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline", color: "#1e40af" }}
                    >
                      Google Cloud Console
                    </a>{" "}
                    and add the URLs above to your OAuth 2.0 Client configuration.
                  </p>
                </div>
              </div>

              {/* Additional Help */}
              <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                <p>
                  <strong>Need detailed instructions?</strong> Check the{" "}
                  <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "3px" }}>
                    GOOGLE_OAUTH_SETUP.md
                  </code>{" "}
                  file in the project root.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={runDiagnostics}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "0.875rem",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Refresh Diagnostics
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "0.875rem",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
