import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { TopBar } from "./TopBar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { useI18n } from "../i18n/useI18n.jsx";
import "./layout.css";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="rc-shell">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="rc-main">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="rc-content">
          <Outlet />
        </main>
        <footer className="rc-footer">
          <p>{t("footer.securityNote")}</p>
        </footer>
        <BottomNav />
      </div>
    </div>
  );
}
