import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaPhone,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

export function ReportMissingPersonPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !date.trim() || !phone.trim())
      return;

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
        .from("missing_persons")
        .insert({
          name: name.trim(),
          last_seen_location: location.trim(),
          contact_info: phone.trim(),
          gender: "unknown",
          date_missing: date.trim(),
          photo_url: null,
          notes: description.trim(),
          user_id: user.id,
        });

      if (insertError) {
        if (insertError.code === "PGRST116") {
          throw new Error(
            "Database table not found. Please create the missing_persons table in Supabase.",
          );
        }
        throw insertError;
      }

      // Clear form
      setName("");
      setLocation("");
      setDate("");
      setDescription("");
      setPhone("");
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
        <FaUser style={{ marginRight: "0.5rem", display: "inline" }} />
        {t("reportMissingPerson.title")}
      </h2>
      <p className="rc-page-subtitle">{t("reportMissingPerson.subtitle")}</p>

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
          {t("reportMissingPerson.successMessage")}
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
        {/* Full Name */}
        <label className="rc-field-label">
          <FaUser style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingPerson.fullName")}
          <input
            className="rc-input"
            type="text"
            required
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* Last Seen Location */}
        <label className="rc-field-label">
          <FaMapMarkerAlt
            style={{ marginRight: "0.5rem", display: "inline" }}
          />
          {t("reportMissingPerson.lastSeenLocation")}
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

        {/* Last Seen Date */}
        <label className="rc-field-label">
          <FaCalendarAlt style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingPerson.lastSeenDate")}
          <input
            className="rc-input"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* Physical Description */}
        <label className="rc-field-label">
          <FaFileAlt style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingPerson.physicalDescription")}
          <textarea
            className="rc-textarea"
            placeholder="Height, build, clothing last worn, distinguishing features…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* Contact Phone */}
        <label className="rc-field-label">
          <FaPhone style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportMissingPerson.contactPhone")}
          <input
            className="rc-input"
            type="tel"
            required
            placeholder="+256…"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
              {t("reportMissingPerson.submitting")}
            </>
          ) : (
            <>
              <FaPaperPlane style={{ marginRight: "0.5rem" }} />
              {t("reportMissingPerson.submit")}
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
