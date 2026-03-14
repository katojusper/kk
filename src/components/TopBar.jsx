import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  getDemoUser,
  getCurrentUser,
  supabase,
} from "../lib/supabaseClient.js";

// Pages where we show a back arrow instead of (or alongside) the menu
const SECONDARY_ROUTES = [
  "/report-crime",
  "/get-help",
  "/lost-and-found",
  "/missing-persons",
  "/report-missing-person",
  "/report-missing-property",
  "/laws-and-rights",
  "/search-stations",
  "/settings",
  "/notifications",
  "/admin/manage-admins",
  "/admin/manage-users",
  "/admin/pending-requests",
  "/admin/uploads",
];

// Maps route path → i18n key for the page title
const ROUTE_TITLE_KEYS = {
  "/report-crime": "reportCrime.title",
  "/get-help": "getHelp.title",
  "/lost-and-found": "lostAndFound.title",
  "/missing-persons": "missingPersons.title",
  "/report-missing-person": "reportMissingPerson.title",
  "/report-missing-property": "reportMissingProperty.title",
  "/laws-and-rights": "lawsAndRights.title",
  "/search-stations": "searchStations.title",
  "/settings": "settings.title",
  "/notifications": "notifications.title",
  "/admin": "admin.dashboard",
  "/admin/manage-admins": "admin.manageAdmins",
  "/admin/manage-users": "admin.manageUsers",
  "/admin/pending-requests": "admin.pendingRequests",
  "/admin/uploads": "admin.allReports",
};

export function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const path = location.pathname;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initUser = async () => {
      // Check demo session first
      const demo = getDemoUser();
      if (demo?.isDemoUser) {
        setUser(demo);
        return;
      }

      // Get real user
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };

    initUser();

    // Subscribe to auth state changes
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const demo = getDemoUser();
        if (demo?.isDemoUser) {
          setUser(demo);
          return;
        }
        const u = session?.user ?? null;
        setUser(u);
      });
      subscription = data.subscription;
    } catch {
      /* ignore */
    }

    return () => {
      try {
        subscription?.unsubscribe();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const getUserName = () => {
    if (user?.isDemoUser) return "Jusper Kato";
    return (
      user?.user_metadata?.username ||
      user?.user_metadata?.display_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Guest"
    );
  };

  const getUserEmail = () => user?.email || "";

  const isSecondary = SECONDARY_ROUTES.includes(path);
  const titleKey = ROUTE_TITLE_KEYS[path] ?? null;
  const pageTitle = titleKey ? t(titleKey) : null;

  const handleBack = () => {
    if (path.startsWith("/admin/")) {
      navigate("/admin");
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="rc-topbar">
      {/* Left side – hamburger OR back arrow + user info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          minWidth: 0,
          flex: 0,
        }}
      >
        {isSecondary ? (
          <button
            type="button"
            className="rc-icon-button rc-back-btn"
            aria-label="Go back"
            onClick={handleBack}
            title="Back"
          >
            ←
          </button>
        ) : (
          <button
            type="button"
            className="rc-icon-button"
            aria-label="Open navigation"
            onClick={onMenuClick}
          >
            ☰
          </button>
        )}

        {/* User info display */}
        {user && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              fontSize: "0.85rem",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: "#1f2937",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {getUserName()}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {getUserEmail()}
            </div>
          </div>
        )}
      </div>

      {/* Centre – title or brand */}
      <div
        className="rc-topbar-title"
        onClick={() => navigate("/main")}
        style={{
          cursor: "pointer",
          flex: 1,
          textAlign: "center",
        }}
      >
        {isSecondary && pageTitle ? (
          <>
            <span className="rc-app-name" style={{ fontSize: "1rem" }}>
              {pageTitle}
            </span>
            <span className="rc-app-subtitle">{t("app.name")} UG</span>
          </>
        ) : (
          <>
            <span className="rc-app-name">{t("app.name")}</span>
            <span className="rc-app-subtitle">{t("app.tagline")}</span>
          </>
        )}
      </div>

      {/* Right side actions */}
      <div className="rc-topbar-actions">
        {/* On secondary pages also show a ✕ "close to home" shortcut */}
        {isSecondary && (
          <button
            type="button"
            className="rc-icon-button"
            aria-label="Close to home"
            onClick={() => navigate("/main")}
            title="Home"
            style={{ fontSize: "1rem", fontWeight: 700 }}
          >
            ✕
          </button>
        )}

        <button
          type="button"
          className="rc-icon-button"
          onClick={() => (window.location.href = "tel:999")}
          aria-label="Emergency call 999"
          title={t("topbar.emergencyCall")}
        >
          📞
        </button>
        <button
          type="button"
          className="rc-icon-button"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
          title={t("topbar.notifications")}
        >
          🔔
        </button>
      </div>
    </header>
  );
}
