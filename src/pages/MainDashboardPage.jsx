import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainCardGrid } from "../components/MainCardGrid.jsx";
import { supabase, getDemoUser } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/useI18n.jsx";
import { FaSearch, FaSignInAlt, FaTimes } from "react-icons/fa";

const BANNER_DISMISSED_KEY = "rc_signin_banner_dismissed";

export function MainDashboardPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(BANNER_DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const demo = getDemoUser();
    if (demo) {
      setUser(demo);
      return;
    }
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data?.user ?? null);
      })
      .catch(() => setUser(null));
  }, []);

  const dismissBanner = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem(BANNER_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const showBanner = !user && !bannerDismissed;

  return (
    <div className="rc-page-container">
      <header style={{ marginBottom: "0.75rem" }}>
        <h2 className="rc-page-title">{t("dashboard.title")}</h2>
        <p className="rc-page-subtitle">{t("dashboard.subtitle")}</p>

        {showBanner && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.65rem 0.9rem",
              borderRadius: "1rem",
              background: "rgba(239, 246, 255, 0.97)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              maxWidth: 540,
              boxShadow: "0 2px 12px rgba(59,130,246,0.08)",
              position: "relative",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#1d4ed8", flex: 1 }}>
              {t("auth.guestBanner")}
            </span>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="rc-primary-button"
              style={{
                marginTop: 0,
                padding: "0.45rem 1.1rem",
                fontSize: "0.78rem",
                boxShadow: "none",
                flexShrink: 0,
              }}
            >
              <FaSignInAlt style={{ marginRight: "0.35rem" }} />
              {t("auth.logIn")}
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#93c5fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.25rem",
                borderRadius: "50%",
                width: 26,
                height: 26,
                flexShrink: 0,
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                e.currentTarget.style.color = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#93c5fd";
              }}
            >
              <FaTimes style={{ fontSize: "0.8rem" }} />
            </button>
          </div>
        )}
      </header>

      {/* Search bar with clear button */}
      <div
        style={{
          marginTop: 12,
          marginBottom: 8,
          position: "relative",
          maxWidth: 520,
        }}
      >
        <FaSearch
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <input
          className="rc-input"
          placeholder={t("dashboard.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            borderRadius: 999,
            paddingLeft: "2.5rem",
            paddingRight: search ? "2.5rem" : "1rem",
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: "0.6rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
              transition: "background 0.2s",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#d1d5db")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e5e7eb")}
          >
            <FaTimes style={{ fontSize: "0.65rem" }} />
          </button>
        )}
      </div>

      <MainCardGrid search={search} />
    </div>
  );
}
