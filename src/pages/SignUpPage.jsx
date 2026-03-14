import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  supabase,
  isSupabaseReachable,
  getConnectionMessage,
  isSupabaseConfigured,
  addDemoUser,
} from "../lib/supabaseClient.js";
import { useToast } from "../components/useToast.js";
import { ToastContainer } from "../components/Toast.jsx";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaGoogle,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

export function SignUpPage() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionWarning, setConnectionWarning] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    const reachable = await isSupabaseReachable();
    if (!reachable) {
      setConnectionWarning(getConnectionMessage());
    } else {
      setConnectionWarning("");
    }
  }

  /** Save user_profiles row + optional welcome notification */
  async function saveUserProfile(user, uname) {
    const profilePayload = {
      user_id: user.id,
      email: user.email,
      username: uname,
      full_name: uname,
      phone_number: null,
      role: "user",
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    const { error: profileErr } = await supabase
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "user_id" });

    if (profileErr) {
      console.warn("[SignUp] profile upsert warning:", profileErr.message);
    }

    // Insert a welcome notification
    await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title: "Welcome to ReportCrime!",
        message: `Hi ${uname}, your account has been created. Stay safe and report any incidents to help your community.`,
        type: "success",
        read: false,
      })
      .then(({ error: notifErr }) => {
        if (notifErr)
          console.warn("[SignUp] notification insert:", notifErr.message);
      });
  }

  /** Auto-create admin record for the designated admin email */
  async function maybeCreateAdminRecord(user, uname) {
    if (user.email !== "jusperkato@gmail.com") return;
    await supabase
      .from("admin_users")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          username: uname,
          role: "super_admin",
          permissions: [
            "view_reports",
            "manage_reports",
            "delete_reports",
            "view_users",
            "manage_users",
            "delete_users",
            "view_admins",
            "manage_admins",
            "delete_admins",
            "send_broadcasts",
            "manage_settings",
            "view_analytics",
            "export_data",
          ],
          is_active: true,
        },
        { onConflict: "user_id" },
      )
      .then(({ error: adminErr }) => {
        if (adminErr) console.warn("[SignUp] admin upsert:", adminErr.message);
      });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim() || trimmedEmail.split("@")[0];

    // ── Offline / demo mode ──────────────────────────────────────────
    const reachable = await isSupabaseReachable();
    if (!reachable || !isSupabaseConfigured) {
      try {
        addDemoUser(trimmedEmail, password, trimmedUsername);
        showToast(
          `Welcome, ${trimmedUsername}! Account created (offline demo). You can now sign in.`,
          "success",
          5000,
        );
        setTimeout(() => navigate("/auth"), 2200);
      } catch (demoErr) {
        setError(demoErr.message || "Failed to create demo account.");
      }
      setLoading(false);
      return;
    }

    // ── Live Supabase signup ─────────────────────────────────────────
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
            display_name: trimmedUsername,
            name: trimmedUsername,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        // Always save profile & notification regardless of email-confirmation state
        await saveUserProfile(data.user, trimmedUsername);
        await maybeCreateAdminRecord(data.user, trimmedUsername);

        const emailConfirmed = !!data.user.confirmed_at || !!data.session;

        if (emailConfirmed) {
          // Session is live — check admin and go straight in
          const { data: adminCheck } = await supabase
            .from("admin_users")
            .select("id")
            .eq("user_id", data.user.id)
            .maybeSingle();

          showToast(
            `Welcome, ${trimmedUsername}! Your account is ready. Redirecting…`,
            "success",
            3500,
          );

          setTimeout(() => {
            navigate(adminCheck ? "/admin" : "/main");
          }, 1600);
        } else {
          // Email confirmation required
          showToast(
            `Account created! Check your email (${trimmedEmail}) to verify before signing in.`,
            "info",
            7000,
          );
          setTimeout(() => navigate("/auth"), 3000);
        }
      }
    } catch (err) {
      const msg = err.message || "Sign up failed. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError("");
    if (!isSupabaseConfigured) {
      setError(
        "Google Sign-Up requires Supabase configuration. Please set up your .env file.",
      );
      return;
    }

    const reachable = await isSupabaseReachable();
    if (!reachable) {
      setError(
        "Cannot connect to server. Google Sign-Up is not available offline.",
      );
      return;
    }

    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (oauthError) throw oauthError;
      // Browser will redirect — no further action needed here
    } catch (err) {
      const msg = err.message || "Google sign-up failed. Please try again.";
      setError(msg);
      showToast(msg, "error");
      setLoading(false);
    }
  }

  return (
    <div className="rc-page-container">
      {/* ── Toast popup notifications ── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="rc-signup-card">
        <div
          style={{
            color: "#e3f2fd",
            marginBottom: 6,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          Create Account
        </div>
        <h2
          style={{
            color: "#ffffff",
            textAlign: "center",
            margin: 0,
            fontSize: "1.7rem",
            fontWeight: 700,
          }}
        >
          Join Us
        </h2>
        <p
          style={{
            color: "#bbdefb",
            textAlign: "center",
            marginTop: 6,
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          Create your account to get started
        </p>

        <form onSubmit={handleSubmit} className="rc-form">
          {/* Connection Warning */}
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
                alignItems: "flex-start",
                gap: "0.5rem",
                lineHeight: 1.5,
              }}
            >
              <FaExclamationTriangle style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Offline Mode:</strong> {connectionWarning}
                <br />
                <small>You can still create a demo account for testing.</small>
              </div>
            </div>
          )}

          {/* Inline error banner */}
          {error && (
            <div
              style={{
                padding: "0.75rem",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                lineHeight: 1.5,
              }}
            >
              <FaExclamationTriangle style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <label className="rc-field-label" style={{ color: "#0b1f3a" }}>
            <FaUser style={{ marginRight: "0.5rem", display: "inline" }} />
            Username
            <input
              className="rc-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              required
              disabled={loading}
              autoComplete="username"
            />
          </label>

          {/* Email */}
          <label className="rc-field-label" style={{ color: "#0b1f3a" }}>
            <FaEnvelope style={{ marginRight: "0.5rem", display: "inline" }} />
            Email
            <input
              className="rc-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </label>

          {/* Password */}
          <label className="rc-field-label" style={{ color: "#0b1f3a" }}>
            <FaLock style={{ marginRight: "0.5rem", display: "inline" }} />
            Password
            <input
              className="rc-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 6 chars)"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </label>

          {/* Confirm Password */}
          <label className="rc-field-label" style={{ color: "#0b1f3a" }}>
            <FaCheckCircle
              style={{ marginRight: "0.5rem", display: "inline" }}
            />
            Confirm Password
            <input
              className="rc-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </label>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>

          {/* Google Sign-Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) =>
              !loading && (e.currentTarget.style.background = "#f9fafb")
            }
            onMouseLeave={(e) =>
              !loading && (e.currentTarget.style.background = "#ffffff")
            }
          >
            {/* Google SVG icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Submit */}
          <button
            type="submit"
            className="rc-primary-button"
            style={{ marginTop: 18, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="rc-spinner"
                  style={{ marginRight: "0.5rem" }}
                />
                Creating account…
              </>
            ) : (
              <>
                <FaUserPlus style={{ marginRight: "0.5rem" }} />
                Sign Up
              </>
            )}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 13,
              color: "#0b1f3a",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/auth"
              style={{
                color: "#e3f2fd",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
