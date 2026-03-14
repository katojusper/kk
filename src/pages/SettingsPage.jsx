import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  FaUser,
  FaGlobe,
  FaBell,
  FaInfoCircle,
  FaSignOutAlt,
  FaEdit,
  FaCheck,
} from "react-icons/fa";

export function SettingsPage() {
  const navigate = useNavigate();
  const { t, lang, setLang, languages, availableLangs } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [langSaved, setLangSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleLangChange = (code) => {
    setLang(code);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="rc-page-container">
        <p className="rc-hint">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">{t("settings.title")}</h2>
      <p className="rc-page-subtitle">{t("settings.subtitle")}</p>

      {/* Account */}
      <section
        className="rc-card"
        style={{ marginBottom: 12, cursor: "default" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="rc-card-title"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FaUser />
              {t("settings.account")}
            </div>
            <p className="rc-card-description">
              {user?.email || t("settings.accountDescription")}
            </p>
            {user?.user_metadata?.username && (
              <p
                className="rc-card-description"
                style={{
                  fontSize: "0.8rem",
                  marginTop: "0.25rem",
                  color: "#6b7280",
                }}
              >
                @{user.user_metadata.username}
              </p>
            )}
          </div>
          <FaEdit style={{ color: "#6b7280" }} />
        </div>
      </section>

      {/* Language */}
      <section className="rc-card" style={{ marginBottom: 12 }}>
        <div
          className="rc-card-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          <FaGlobe />
          {t("settings.language")}
          {langSaved && (
            <span
              style={{
                marginLeft: "0.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                color: "#059669",
                fontWeight: 500,
              }}
            >
              <FaCheck style={{ fontSize: "0.7rem" }} />
              Saved
            </span>
          )}
        </div>
        <p className="rc-card-description" style={{ marginBottom: "0.75rem" }}>
          {t("settings.selectLanguage")}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {availableLangs.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleLangChange(code)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "999px",
                border: `1px solid ${lang === code ? "#667eea" : "#d1d5db"}`,
                background:
                  lang === code
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#f9fafb",
                color: lang === code ? "#fff" : "#374151",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: lang === code ? 600 : 400,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              {lang === code && <FaCheck style={{ fontSize: "0.65rem" }} />}
              {languages[code] || code.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="rc-card" style={{ marginBottom: 12 }}>
        <div
          className="rc-card-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          <FaBell />
          {t("settings.notificationsSection")}
        </div>
        <p className="rc-card-description" style={{ marginBottom: "0.75rem" }}>
          {t("settings.notificationsDescription")}
        </p>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              padding: "0.5rem 0",
            }}
          >
            <div
              onClick={() => setEmailNotif((v) => !v)}
              style={{
                width: "2.25rem",
                height: "1.25rem",
                borderRadius: "999px",
                background: emailNotif
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#d1d5db",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "0.125rem",
                  left: emailNotif ? "1.125rem" : "0.125rem",
                  width: "1rem",
                  height: "1rem",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
            <span style={{ fontSize: "0.875rem", color: "#374151" }}>
              {t("settings.emailNotifications")}
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              padding: "0.5rem 0",
            }}
          >
            <div
              onClick={() => setPushNotif((v) => !v)}
              style={{
                width: "2.25rem",
                height: "1.25rem",
                borderRadius: "999px",
                background: pushNotif
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#d1d5db",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "0.125rem",
                  left: pushNotif ? "1.125rem" : "0.125rem",
                  width: "1rem",
                  height: "1rem",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
            <span style={{ fontSize: "0.875rem", color: "#374151" }}>
              {t("settings.pushNotifications")}
            </span>
          </label>
        </div>
      </section>

      {/* About */}
      <section className="rc-card" style={{ marginBottom: 12 }}>
        <div
          className="rc-card-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          <FaInfoCircle />
          {t("settings.about")}
        </div>
        <p className="rc-card-description">{t("settings.appVersion")}</p>
        <p
          className="rc-card-description"
          style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}
        >
          {t("settings.builtWith")}
        </p>
      </section>

      {/* Sign Out */}
      <button
        type="button"
        onClick={handleLogout}
        className="rc-primary-button"
        style={{
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          marginTop: "1rem",
        }}
      >
        <FaSignOutAlt style={{ marginRight: "0.5rem" }} />
        {t("settings.signOut")}
      </button>
    </div>
  );
}
