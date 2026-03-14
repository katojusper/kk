import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useToast } from "../components/useToast.js";
import { ToastContainer } from "../components/Toast.jsx";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Completing sign in...");
  const { toasts, showToast, removeToast } = useToast();
  const handled = useRef(false);
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);
  const stableShowToast = useCallback(
    (...args) => showToastRef.current(...args),
    [],
  );

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const handleCallback = async () => {
      try {
        // Check for OAuth callback parameters
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const accessToken = hashParams.get("access_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        // Also check query params for errors (Google OAuth errors come here)
        const code = searchParams.get("code");
        const queryError = searchParams.get("error");
        const queryErrorDescription = searchParams.get("error_description");

        if (error || queryError) {
          const errorMsg =
            errorDescription || queryErrorDescription || error || queryError;
          console.error("OAuth error:", errorMsg);

          let userMessage = "Authentication failed. ";
          if (errorMsg.includes("access_denied")) {
            userMessage += "You cancelled the login. Please try again.";
          } else if (errorMsg.includes("redirect_uri_mismatch")) {
            userMessage +=
              "OAuth configuration error — redirect URI mismatch. Check Google Console & Supabase allowed URLs.";
          } else {
            userMessage += errorMsg;
          }

          setStatus(userMessage);
          stableShowToast(userMessage, "error", 6000);
          setTimeout(() => navigate("/auth"), 3500);
          return;
        }

        if (accessToken || code) {
          // Supabase handles OAuth automatically via PKCE flow
          // Wait a bit for Supabase to process the token
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);
            throw sessionError;
          }

          if (session) {
            const user = session.user;

            const displayName =
              user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.username ||
              user.email?.split("@")[0] ||
              "User";

            // Upsert user profile (handles both new and returning Google users)
            const { error: profileErr } = await supabase
              .from("user_profiles")
              .upsert(
                {
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
                  avatar_url:
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture ||
                    null,
                  role: "user",
                  is_active: true,
                  last_login: new Date().toISOString(),
                },
                { onConflict: "user_id" },
              );

            if (profileErr) {
              console.warn(
                "[AuthCallback] profile upsert:",
                profileErr.message,
              );
            }

            // Insert welcome notification only for brand-new profiles
            const { count: notifCount } = await supabase
              .from("notifications")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id);

            if ((notifCount ?? 0) === 0) {
              await supabase.from("notifications").insert({
                user_id: user.id,
                title: "Welcome to ReportCrime!",
                message: `Hi ${displayName}, your Google account has been linked. Stay safe and report any incidents to help your community.`,
                type: "success",
                read: false,
              });
            }

            // Check if admin
            const { data: adminCheck } = await supabase
              .from("admin_users")
              .select("id")
              .eq("user_id", user.id)
              .maybeSingle();

            // Check if hardcoded admin email
            const isHardcodedAdmin = ["jusperkato@gmail.com"].includes(
              user.email,
            );

            const isAdmin = !!(adminCheck || isHardcodedAdmin);

            const successMsg = `Welcome${isAdmin ? " back, Admin" : `, ${displayName}`}! Sign in successful.`;
            setStatus(successMsg);
            stableShowToast(successMsg, "success", 3500);

            setTimeout(() => {
              navigate(isAdmin ? "/admin" : "/main");
            }, 1200);
          } else {
            setStatus("Session not found. Redirecting to login...");
            stableShowToast(
              "Session not found — redirecting to login.",
              "warning",
            );
            setTimeout(() => navigate("/auth"), 2000);
          }
        } else {
          // Check for password reset token
          const token = searchParams.get("token");
          const type = searchParams.get("type");

          if (type === "recovery" && token) {
            navigate(`/auth/reset-password?token=${token}`);
            return;
          }

          // No OAuth params, check current session
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            navigate("/main");
          } else {
            navigate("/auth");
          }
        }
      } catch (err) {
        console.error("Callback error:", err);
        let errorMessage = "Authentication failed. ";

        if (err.message?.includes("Invalid login credentials")) {
          errorMessage += "Please try signing in again.";
        } else if (err.message?.includes("Email not confirmed")) {
          errorMessage += "Please verify your email address before signing in.";
        } else if (err.message?.includes("Failed to fetch")) {
          errorMessage += "Network error. Please check your connection.";
        } else {
          errorMessage += err.message || "Unknown error occurred.";
        }

        setStatus(errorMessage);
        stableShowToast(errorMessage, "error", 6000);
        setTimeout(() => navigate("/auth"), 4000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, stableShowToast]);

  return (
    <div
      className="rc-page-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="rc-splash-loader" style={{ marginBottom: "1rem" }} />
      <p
        style={{
          fontSize: "1.1rem",
          color: "#6b7280",
          textAlign: "center",
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        {status}
      </p>
    </div>
  );
}
