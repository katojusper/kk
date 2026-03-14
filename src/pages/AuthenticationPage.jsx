import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  supabase,
  tryDemoLogin,
  isSupabaseReachable,
  getConnectionMessage,
  isSupabaseConfigured,
} from "../lib/supabaseClient.js";
import { useToast } from "../components/useToast.js";
import { ToastContainer } from "../components/Toast.jsx";
import {
  FaEnvelope,
  FaLock,
  FaPhone,
  FaSignInAlt,
  FaGoogle,
  FaExclamationTriangle,
  FaTools,
} from "react-icons/fa";
import { ConnectionDiagnostic } from "../components/ConnectionDiagnostic.jsx";

export function AuthenticationPage() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [connectionWarning, setConnectionWarning] = useState("");
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    const reachable = await isSupabaseReachable();
    if (!reachable) {
      const message = getConnectionMessage();
      setConnectionWarning(message);
    } else {
      setConnectionWarning("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    // Check connection first
    const reachable = await isSupabaseReachable();

    if (!reachable || !isSupabaseConfigured) {
      // Try demo/offline login
      const demoResult = tryDemoLogin(trimmedEmail, trimmedPassword);
      if (demoResult) {
        showToast(
          `Welcome back! Signed in as ${demoResult.isAdmin ? "Admin" : "User"} (offline mode).`,
          "success",
          4000,
        );
        setTimeout(() => {
          navigate(demoResult.isAdmin ? "/admin" : "/main");
        }, 1000);
        setLoading(false);
        return;
      } else {
        setError("Cannot connect to server. Only demo accounts work offline.");
        showToast("Cannot connect — only demo accounts work offline.", "error");
        setLoading(false);
        return;
      }
    }

    try {
      // ── Attempt Supabase login ──────────────────────────────────────
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: trimmedEmail,
          password: trimmedPassword,
        },
      );

      if (authError) throw authError;

      if (data.session) {
        // Update phone if provided
        if (phone.trim()) {
          await supabase.auth
            .updateUser({ data: { phone: phone.trim() } })
            .catch(() => {});
        }

        // Check if user profile exists, create if not
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("user_id")
            .eq("user_id", user.id)
            .single();

          if (!existingProfile) {
            // Create user profile
            await supabase
              .from("user_profiles")
              .insert({
                user_id: user.id,
                email: user.email,
                username:
                  user.user_metadata?.username ||
                  user.user_metadata?.name ||
                  user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "User",
                full_name:
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.user_metadata?.username ||
                  "User",
                phone_number: phone.trim() || null,
                role: "user",
                is_active: true,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
              })
              .catch((err) => {
                console.log("Profile creation error (may already exist):", err);
              });
          } else {
            // Update last login
            await supabase
              .from("user_profiles")
              .update({ last_login: new Date().toISOString() })
              .eq("user_id", user.id)
              .catch(() => {});
          }
        }

        // Check if admin and redirect
        const { data: adminCheck } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", data.session.user.id)
          .maybeSingle()
          .catch(() => ({ data: null }));

        // Also check if demo admin email regardless of DB
        const isHardcodedAdmin = ["jusperkato@gmail.com"].includes(
          trimmedEmail,
        );

        const isAdmin = !!(adminCheck || isHardcodedAdmin);
        const displayName =
          data.session.user.user_metadata?.name ||
          data.session.user.user_metadata?.username ||
          trimmedEmail.split("@")[0];

        showToast(
          `Welcome back, ${displayName}! ${isAdmin ? "Redirecting to Admin Dashboard…" : "Signed in successfully!"}`,
          "success",
          3500,
        );

        setTimeout(() => {
          navigate(isAdmin ? "/admin" : "/main");
        }, 900);
      }
    } catch (supabaseErr) {
      console.error("Login error:", supabaseErr);
      const errMsg = supabaseErr?.message || "";
      const isNetworkErr =
        errMsg.toLowerCase().includes("failed to fetch") ||
        errMsg.toLowerCase().includes("networkerror") ||
        errMsg.toLowerCase().includes("fetch") ||
        errMsg.toLowerCase().includes("network") ||
        errMsg.toLowerCase().includes("invalid api key") ||
        errMsg.toLowerCase().includes("jwt") ||
        supabaseErr?.name === "TypeError";

      if (isNetworkErr || !errMsg) {
        // ── Fallback: Demo / offline login ──────────────────────────────────
        const demoResult = tryDemoLogin(trimmedEmail, trimmedPassword);
        if (demoResult) {
          showToast("Signed in (demo/offline mode).", "success", 3500);
          setTimeout(() => navigate("/admin"), 800);
          return;
        }

        // Real network error, not a credentials issue
        const netMsg =
          "Cannot reach the server. Please check your internet connection or Supabase configuration.";
        setError(netMsg);
        showToast(netMsg, "error");
      } else {
        // ── Show error ─────────────────────────────────────────────────────
        const loginMsg =
          errMsg ||
          "Login failed. Please check your credentials and try again.";
        setError(loginMsg);
        showToast(loginMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      const cfgMsg =
        "Google Sign-In requires Supabase configuration. Please set up your .env file with VITE_SUPABASE_ANON_KEY.";
      setError(cfgMsg);
      showToast(cfgMsg, "warning", 6000);
      return;
    }

    const reachable = await isSupabaseReachable();
    if (!reachable) {
      const netMsg =
        "Cannot connect to server. Please check your internet connection.";
      setError(netMsg);
      showToast(netMsg, "error");
      return;
    }

    setLoading(true);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
          skipBrowserRedirect: false,
        },
      });

      if (oauthError) {
        console.error("Google OAuth error:", oauthError);
        throw oauthError;
      }

      // The browser will redirect to Google, so we don't need to do anything else
      // If we reach here without redirect, something went wrong
      if (!data?.url) {
        throw new Error(
          "Failed to initiate Google sign-in. No redirect URL received.",
        );
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      let errorMessage = "Google sign-in failed. ";

      if (err.message?.includes("Provider not enabled")) {
        errorMessage +=
          "Google authentication is not enabled. Please contact administrator.";
      } else if (err.message?.includes("redirect_uri_mismatch")) {
        errorMessage +=
          "OAuth configuration error. Please check redirect URIs in Google Console.";
      } else if (err.message?.includes("invalid_request")) {
        errorMessage +=
          "OAuth configuration error. Please verify Google Cloud Console settings.";
      } else {
        errorMessage +=
          err.message || "Please try again or use email/password login.";
      }

      setError(errorMessage);
      showToast(errorMessage, "error", 6000);
      setLoading(false);
    }
  }

  async function handlePhoneSignIn() {
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: phoneError } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: { channel: "sms" },
      });
      if (phoneError) throw phoneError;
      setSuccess("SMS code sent! Check your phone.");
    } catch (err) {
      setError(err.message || "Phone sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!resetEmail.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        { redirectTo: `${window.location.origin}/auth/reset-password` },
      );
      if (resetError) throw resetError;
      setSuccess("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rc-page-container">
      {/* ── Toast popup notifications ── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="rc-auth-card">
        {/* ── Header ── */}
        <div className="rc-auth-header">
          <div style={{ fontWeight: 600 }}>Login</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Welcome back</div>
        </div>

        <h2 className="rc-page-title">Welcome back</h2>
        <p className="rc-page-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="rc-form">
          {/* ── Connection Warning ── */}
          {connectionWarning && (
            <div
              style={{
                padding: "0.75rem",
                background: "#fef3c7",
                color: "#92400e",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                lineHeight: 1.5,
              }}
            >
              <FaExclamationTriangle style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong>Offline Mode:</strong> {connectionWarning}
                <br />
                <small>Demo admin account still works for testing.</small>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnostic(true)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #f59e0b",
                  background: "white",
                  color: "#f59e0b",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                <FaTools size={12} />
                Diagnose
              </button>
            </div>
          )}

          {/* ── Error / Success banners ── */}
          {error && (
            <div
              style={{
                padding: "0.75rem",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "0.75rem",
                background: "#d1fae5",
                color: "#065f46",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
            >
              {success}
            </div>
          )}

          {showForgotPassword ? (
            <div>
              <label className="rc-field-label">
                <FaEnvelope
                  style={{ marginRight: "0.5rem", display: "inline" }}
                />
                Email Address
                <input
                  className="rc-input"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </label>
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
              >
                <button
                  type="button"
                  className="rc-primary-button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setError("");
                  }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "999px",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="rc-field-label">
                <FaEnvelope
                  style={{ marginRight: "0.5rem", display: "inline" }}
                />
                Email or Username
                <input
                  className="rc-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </label>

              <label className="rc-field-label">
                <FaLock style={{ marginRight: "0.5rem", display: "inline" }} />
                Password
                <input
                  className="rc-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </label>

              <label className="rc-field-label">
                <FaPhone style={{ marginRight: "0.5rem", display: "inline" }} />
                Phone Number (optional, e.g. +25677457890)
                <input
                  className="rc-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256…"
                  disabled={loading}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: 13,
                  marginTop: -4,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#1d4ed8",
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="rc-primary-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="rc-spinner"
                      style={{ marginRight: "0.5rem" }}
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    <FaSignInAlt style={{ marginRight: "0.5rem" }} />
                    Login
                  </>
                )}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <div
                  style={{ flex: 1, height: "1px", background: "#e5e7eb" }}
                />
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  OR
                </span>
                <div
                  style={{ flex: 1, height: "1px", background: "#e5e7eb" }}
                />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  padding: "0.75rem 1rem",
                  background: "#ffffff",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) =>
                  !loading && (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  !loading && (e.currentTarget.style.background = "#ffffff")
                }
              >
                <FaGoogle style={{ color: "#4285F4" }} />
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handlePhoneSignIn}
                disabled={loading}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  padding: "0.75rem 1rem",
                  background: "#f9fafb",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  !loading && (e.currentTarget.style.background = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  !loading && (e.currentTarget.style.background = "#f9fafb")
                }
              >
                <FaPhone />
                Continue with Phone
              </button>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#1d4ed8",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign Up
            </Link>
          </div>
        </form>

        {/* Diagnostic Tool Link */}
        {!connectionWarning && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => setShowDiagnostic(true)}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
                padding: "4px 8px",
              }}
            >
              <FaTools
                style={{ marginRight: "6px", display: "inline" }}
                size={12}
              />
              Connection Issues? Run Diagnostic
            </button>
          </div>
        )}
      </div>

      {/* Diagnostic Modal */}
      {showDiagnostic && (
        <ConnectionDiagnostic onClose={() => setShowDiagnostic(false)} />
      )}
    </div>
  );
}
