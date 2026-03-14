import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase, getDemoUser, clearDemoUser } from "../lib/supabaseClient.js";
import { isAdmin } from "../lib/authHelpers.js";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  FaTachometerAlt,
  FaCog,
  FaBell,
  FaLifeRing,
  FaUserShield,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

export function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check demo session first
      const demo = getDemoUser();
      if (demo?.isDemoUser) {
        setUser(demo);
        setAdminUser(true);
        return;
      }

      // Real Supabase session
      try {
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        setUser(u ?? null);
        if (u) {
          const admin = await isAdmin();
          setAdminUser(admin);
        }
      } catch {
        setUser(null);
        setAdminUser(false);
      }
    };

    init();

    // Subscribe to auth state changes (login / logout / token refresh)
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const demo = getDemoUser();
        if (demo?.isDemoUser) {
          setUser(demo);
          setAdminUser(true);
          return;
        }
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          isAdmin()
            .then(setAdminUser)
            .catch(() => setAdminUser(false));
        } else {
          setAdminUser(false);
        }
      });
      subscription = data.subscription;
    } catch {
      // Supabase may be unreachable in demo mode — that's fine
    }

    return () => {
      try {
        subscription?.unsubscribe();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const getUserInitials = () => {
    const name =
      user?.user_metadata?.username ||
      user?.user_metadata?.display_name ||
      user?.user_metadata?.name;
    if (name) return name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getUserName = () => {
    if (user?.isDemoUser) return "Jusper Kato";
    return (
      user?.user_metadata?.username ||
      user?.user_metadata?.display_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User"
    );
  };

  const getUserEmail = () => user?.email || "";

  // Base nav items
  const baseNavItems = [
    { to: "/main", label: t("nav.dashboard"), icon: FaTachometerAlt },
    { to: "/notifications", label: t("nav.notifications"), icon: FaBell },
    { to: "/get-help", label: t("nav.getHelp"), icon: FaLifeRing },
    { to: "/settings", label: t("nav.settings"), icon: FaCog },
  ];

  // Admin-only nav item
  const adminNavItems = adminUser
    ? [
        {
          to: "/admin",
          label: t("nav.admin"),
          icon: FaUserShield,
          isAdmin: true,
        },
      ]
    : [];

  const allNavItems = [...baseNavItems, ...adminNavItems];

  const handleLogout = async () => {
    clearDemoUser();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore network errors during logout
    }
    setUser(null);
    setAdminUser(false);
    navigate("/auth");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 29,
            transition: "opacity 0.3s ease",
          }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`rc-sidebar ${open ? "rc-sidebar--open" : ""}`}>
        {/* ── Header ── */}
        <div className="rc-sidebar-header">
          <div
            className="rc-avatar"
            style={{
              background: adminUser
                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                : undefined,
            }}
          >
            {getUserInitials()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="rc-sidebar-name">
              {getUserName()}
              {adminUser && (
                <span
                  style={{
                    marginLeft: "0.4rem",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "0.1rem 0.45rem",
                    verticalAlign: "middle",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  Admin
                </span>
              )}
              {user?.isDemoUser && (
                <span
                  style={{
                    marginLeft: "0.3rem",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    background: "rgba(107,114,128,0.15)",
                    color: "#6b7280",
                    borderRadius: "999px",
                    padding: "0.1rem 0.4rem",
                    verticalAlign: "middle",
                  }}
                >
                  demo
                </span>
              )}
            </div>
            <div className="rc-sidebar-email">{getUserEmail()}</div>
          </div>

          <button
            type="button"
            className="rc-icon-button rc-sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <FaTimes style={{ fontSize: "0.9rem" }} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="rc-sidebar-nav">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rc-sidebar-link ${isActive ? "rc-sidebar-link--active" : ""} ${
                    item.isAdmin ? "rc-sidebar-link--admin" : ""
                  }`
                }
                onClick={onClose}
                style={
                  item.isAdmin
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.1) 100%)",
                        borderLeft: "3px solid #f59e0b",
                        marginTop: "0.5rem",
                      }
                    : undefined
                }
              >
                <Icon
                  style={{
                    marginRight: "0.6rem",
                    fontSize: "0.9rem",
                    color: item.isAdmin ? "#f59e0b" : undefined,
                    flexShrink: 0,
                  }}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Logout ── */}
        <button
          type="button"
          className="rc-sidebar-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt style={{ marginRight: "0.5rem", fontSize: "0.9rem" }} />
          {t("auth.logout")}
        </button>
      </aside>
    </>
  );
}
