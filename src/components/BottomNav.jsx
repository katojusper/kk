import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaLifeRing,
  FaBell,
  FaCog,
  FaUserShield,
} from "react-icons/fa";
import { supabase, getDemoUser } from "../lib/supabaseClient.js";
import { isAdmin } from "../lib/authHelpers.js";
import { useI18n } from "../i18n/useI18n.jsx";

export function BottomNav() {
  const { t } = useI18n();
  const [adminUser, setAdminUser] = useState(false);

  useEffect(() => {
    const init = async () => {
      const demo = getDemoUser();
      if (demo?.isDemoUser) {
        setAdminUser(true);
        return;
      }
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const admin = await isAdmin();
          setAdminUser(admin);
        }
      } catch {
        setAdminUser(false);
      }
    };
    init();

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const demo = getDemoUser();
        if (demo?.isDemoUser) {
          setAdminUser(true);
          return;
        }
        if (session?.user) {
          isAdmin()
            .then(setAdminUser)
            .catch(() => setAdminUser(false));
        } else {
          setAdminUser(false);
        }
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

  const navItems = [
    {
      to: "/main",
      icon: FaTachometerAlt,
      label: t("nav.dashboard"),
    },
    {
      to: "/get-help",
      icon: FaLifeRing,
      label: t("nav.getHelp").split(" / ")[0],
    },
    {
      to: "/notifications",
      icon: FaBell,
      label: t("nav.notifications"),
    },
    ...(adminUser
      ? [{ to: "/admin", icon: FaUserShield, label: "Admin", isAdmin: true }]
      : [{ to: "/settings", icon: FaCog, label: t("nav.settings") }]),
  ];

  return (
    <nav className="rc-bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rc-bottom-nav-item${isActive ? " rc-bottom-nav-item--active" : ""}${
                item.isAdmin ? " rc-bottom-nav-item--admin" : ""
              }`
            }
          >
            <Icon className="rc-bottom-nav-icon" />
            <span className="rc-bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
