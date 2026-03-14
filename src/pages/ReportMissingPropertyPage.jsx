import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  FaBox,
  FaTag,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

export function ReportMissingPropertyPage() {
  const { t } = useI18n();
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error(t("common.notAuthenticated"));

      const { error: insertError } = await supabase
        .from("missing_property")
        .insert({
          item_name: itemName.trim(),
          category: category || "other",
          last_seen_location: location.trim(),
          date_lost: date.trim(),
          description: description.trim(),
          user_id: user.id,
        });

      if (insertError) {
        if (insertError.code === "PGRST116") {
          throw new Error(
            "Database table not found. Please create the missing_property table in Supabase.",
          );
        }
        throw insertError;
      }

      // Clear form
      setItemName("");
      setCategory("");
      setLocation("");
      setDate("");
      setDescription("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 7000);
    } catch (err) {
      setError(
        `${t("common.error")}: ${err?.message ?? t("common.unknownError")}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">
        <FaBox style={{ marginRight: "0.5rem", display: "inline" }} />
        {t("reportMissingProperty.title")}
      </h2>
      <p className="rc-page-subtitle">{t("reportMissingProperty.subtitle")}</p>

      {/* Success banner */}
      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.85rem 1rem",
            background: "#d1fae5",
            color: "#065f46",
            borderRadius: "0.75rem",
            fontSize: "0.9rem",
            marginBottom: "1rem",
            border: "1px solid #6ee7b7",
          }}
        >
          <FaCheckCircle style={{ flexShrink: 0 }} />
          {t("reportMissingProperty.successMessage")}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            padding: "0.85rem 1rem",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            marginBottom: "1rem",
            border: "1px solid #fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <form className="rc-form" onSubmit={handleSubmit}>
        {/* Item Name */}
        <label className="rc-field-label">
          <FaBox style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingProperty.itemName")}
          <input
            className="rc-input"
            type="text"
            required
            placeholder="e.g. Black leather wallet"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* Category */}
        <label className="rc-field-label">
          <FaTag style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingProperty.category")}
          <select
            className="rc-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
          >
            <option value="" disabled>
              {t("reportMissingProperty.selectCategory")}
            </option>
            <option value="id">{t("reportMissingProperty.catId")}</option>
            <option value="electronics">
              {t("reportMissingProperty.catElectronics")}
            </option>
            <option value="bag">{t("reportMissingProperty.catBag")}</option>
            <option value="other">{t("reportMissingProperty.catOther")}</option>
          </select>
        </label>

        {/* Last Seen Location */}
        <label className="rc-field-label">
          <FaMapMarkerAlt
            style={{ marginRight: "0.5rem", display: "inline" }}
          />
          {t("reportMissingProperty.lastSeenLocation")}
          <input
            className="rc-input"
            type="text"
            required
            placeholder="e.g. Kampala Road, near Shell"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* Date Lost */}
        <label className="rc-field-label">
          <FaCalendarAlt style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingProperty.dateLost")}
          <input
            className="rc-input"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* Description */}
        <label className="rc-field-label">
          <FaFileAlt style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingProperty.description")}
          <textarea
            className="rc-textarea"
            placeholder={t("reportMissingProperty.descriptionPlaceholder")}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="rc-primary-button"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <FaSpinner
                style={{
                  marginRight: "0.5rem",
                  animation: "spin 1s linear infinite",
                }}
              />
              {t("reportMissingProperty.submitting")}
            </>
          ) : (
            <>
              <FaPaperPlane style={{ marginRight: "0.5rem" }} />
              {t("reportMissingProperty.submit")}
            </>
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
