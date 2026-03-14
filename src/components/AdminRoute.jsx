import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../lib/authHelpers.js";
import { getDemoUser } from "../lib/supabaseClient.js";

export function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      // Fast-path: demo user in session storage
      const demo = getDemoUser();
      if (demo?.isDemoUser) {
        setIsUserAdmin(true);
        setChecking(false);
        return;
      }

      const admin = await isAdmin();
      setIsUserAdmin(admin);
      setChecking(false);
    };
    checkAdmin();
  }, []);

  if (checking) {
    return (
      <div
        className="rc-page-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <div className="rc-splash-loader" />
      </div>
    );
  }

  return isUserAdmin ? children : <Navigate to="/main" replace />;
}
