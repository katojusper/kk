import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/useI18n.jsx";

export function SplashPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Check if user is already logged in
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Wait for splash animation (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Navigate to home if logged in, otherwise still show home (login optional)
        if (session) {
          // Check if user is admin
          const { data: adminCheck } = await supabase
            .from("admin_users")
            .select("id")
            .eq("user_id", session.user.id)
            .single();

          navigate(adminCheck ? "/admin" : "/main");
        } else {
          navigate("/main");
        }
      } catch {
        // On error, fall back to home
        setTimeout(() => navigate("/main"), 2000);
      }
    };

    checkAuthAndNavigate();
  }, [navigate]);

  return (
    <div className="rc-page-container rc-splash-container">
      <div className="rc-splash-logo">
        <div className="rc-splash-icon">🛡️</div>
      </div>
      <h1 className="rc-splash-title">{t("splash.welcome")}</h1>
      <p className="rc-splash-subtitle">{t("splash.loading")}</p>
      <div className="rc-splash-loader" />
    </div>
  );
}
