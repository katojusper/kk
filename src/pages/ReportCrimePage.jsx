import { useState, useEffect } from "react";
import { submitCrimeReport } from "../services/crimeReports.js";
import { useI18n } from "../i18n/useI18n.jsx";
import { useNavigate } from "react-router-dom";
import {
  FaGavel,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaUpload,
  FaPaperPlane,
  FaLocationArrow,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

export function ReportCrimePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState("crime"); // 'crime' | 'complaint'
  const [fileName, setFileName] = useState(t("reportCrime.noFileSelected"));
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState("");
  const [autoLocation, setAutoLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");

  // Auto-detect location when crime mode is selected
  useEffect(() => {
    if (mode === "crime") {
      detectLocation();
    }
  }, [mode]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setAutoLocation("Geolocation not supported");
      return;
    }

    setLocating(true);
    setLocationError("");
    setAutoLocation("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Try reverse-geocoding via nominatim (free, no key required)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (res.ok) {
            const data = await res.json();
            const display =
              data.display_name ||
              `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            setAutoLocation(display);
          } else {
            setAutoLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch {
          setAutoLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setLocating(false);
      },
      (err) => {
        const messages = {
          1: "Location access denied. Please allow location in your browser.",
          2: "Location unavailable. Check your device GPS.",
          3: "Location request timed out. Please try again.",
        };
        const msg = messages[err.code] || "Unable to detect location.";
        setLocationError(msg);
        setAutoLocation("Could not detect location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setFileName(t("reportCrime.noFileSelected"));
    setFile(null);
    setError("");
    setSuccess(false);
    if (newMode === "crime") {
      detectLocation();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date.trim() || !description.trim()) return;

    const effectiveLocation =
      mode === "crime"
        ? autoLocation || "Location not available"
        : location.trim();

    setSubmitting(true);
    setSuccess(false);
    setError("");

    try {
      await submitCrimeReport({
        type: mode === "crime" ? "Crime" : "Complaint",
        location: effectiveLocation,
        date: date.trim(),
        description: description.trim(),
        file,
        category: category || "other",
      });
      setLocation("");
      setDate("");
      setDescription("");
      setCategory("");
      setFile(null);
      setFileName(t("reportCrime.noFileSelected"));
      setShowSuccessModal(true);
      // Re-detect location after submit so next crime report is ready
      if (mode === "crime") detectLocation();
    } catch (err) {
      setError(`Error submitting report: ${err?.message ?? "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">
        <FaGavel style={{ marginRight: "0.5rem", display: "inline" }} />
        {t("reportCrime.title")}
      </h2>
      <p className="rc-page-subtitle">{t("reportCrime.subtitle")}</p>

      {error && (
        <div
          style={{
            padding: "0.85rem 1rem",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Crime / Complaint toggle */}
      <div className="rc-pill-toggle" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={mode === "crime" ? "rc-pill-toggle-active" : ""}
          onClick={() => handleModeSwitch("crime")}
        >
          {t("reportCrime.tabCrime")}
        </button>
        <button
          type="button"
          className={mode === "complaint" ? "rc-pill-toggle-active" : ""}
          onClick={() => handleModeSwitch("complaint")}
        >
          {t("reportCrime.tabComplaint")}
        </button>
      </div>

      <form className="rc-form" onSubmit={handleSubmit}>
        {/* Category */}
        <label className="rc-field-label">
          {t("reportCrime.category")}
          <select
            className="rc-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
          >
            <option value="" disabled>
              {t("reportCrime.selectCategory")}
            </option>
            <option value="theft">{t("reportCrime.categoryTheft")}</option>
            <option value="assault">{t("reportCrime.categoryAssault")}</option>
            <option value="fraud">{t("reportCrime.categoryFraud")}</option>
            <option value="other">{t("reportCrime.categoryOther")}</option>
          </select>
        </label>

        {/* Location */}
        {mode === "crime" ? (
          <label className="rc-field-label">
            <FaMapMarkerAlt
              style={{ marginRight: "0.5rem", display: "inline" }}
            />
            {t("reportCrime.locationAuto")}
            <div style={{ position: "relative" }}>
              <input
                className="rc-input"
                type="text"
                value={
                  locating
                    ? "Detecting your location…"
                    : autoLocation || t("reportCrime.locationAutoPlaceholder")
                }
                readOnly
                style={{
                  paddingRight: "3rem",
                  background: locating
                    ? "#f3f4f6"
                    : autoLocation
                      ? "#f0fdf4"
                      : "#f3f4f6",
                  color: autoLocation && !locating ? "#065f46" : "#6b7280",
                  fontStyle: locating || !autoLocation ? "italic" : "normal",
                  cursor: "not-allowed",
                }}
              />
              {/* Refresh button */}
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating || submitting}
                title="Re-detect location"
                style={{
                  position: "absolute",
                  right: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: locating || submitting ? "not-allowed" : "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  color: locating ? "#9ca3af" : "#667eea",
                  transition: "color 0.2s",
                }}
              >
                {locating ? (
                  <FaSpinner
                    style={{
                      animation: "spin 1s linear infinite",
                      fontSize: "0.9rem",
                    }}
                  />
                ) : (
                  <FaLocationArrow style={{ fontSize: "0.9rem" }} />
                )}
              </button>
            </div>
            {locationError && (
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#dc2626",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {locationError}
              </span>
            )}
            {autoLocation && !locating && !locationError && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                📍 Location auto-detected. Click{" "}
                <FaLocationArrow
                  style={{ display: "inline", fontSize: "0.65rem" }}
                />{" "}
                to refresh.
              </span>
            )}
          </label>
        ) : (
          <label className="rc-field-label">
            <FaMapMarkerAlt
              style={{ marginRight: "0.5rem", display: "inline" }}
            />
            {t("reportCrime.locationManual")}
            <input
              className="rc-input"
              type="text"
              placeholder={t("reportCrime.locationPlaceholder")}
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={submitting}
            />
          </label>
        )}

        {/* Date */}
        <label className="rc-field-label">
          <FaCalendarAlt style={{ marginRight: "0.5rem", display: "inline" }} />
          {t("reportCrime.date")}
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
          {t("reportCrime.description")}
          <textarea
            className="rc-textarea"
            placeholder={t("reportCrime.descriptionPlaceholder")}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* File upload */}
        <div
          style={{
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: "0.9rem 1rem",
            background: "#ffffff",
          }}
        >
          <div className="rc-field-label">{t("reportCrime.uploadFile")}</div>
          <p className="rc-hint" style={{ marginBottom: 6 }}>
            {t("reportCrime.uploadHint")}
          </p>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: submitting ? "not-allowed" : "pointer",
              borderRadius: 999,
              padding: "0.45rem 1rem",
              background: submitting ? "#9ca3af" : "#0a73ff",
              color: "#f9fafb",
              fontSize: 14,
              opacity: submitting ? 0.6 : 1,
              transition: "background 0.2s",
            }}
          >
            <FaUpload style={{ marginRight: "0.25rem" }} />
            {t("reportCrime.chooseFile")}
            <input
              type="file"
              style={{ display: "none" }}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null;
                setFile(selected);
                setFileName(
                  selected ? selected.name : t("reportCrime.noFileSelected"),
                );
              }}
              disabled={submitting}
            />
          </label>
          <div className="rc-file-pill" style={{ marginTop: 8 }}>
            <span>{fileName}</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="rc-primary-button"
          disabled={submitting || (mode === "crime" && locating)}
        >
          {submitting ? (
            <>
              <FaSpinner
                style={{
                  marginRight: "0.5rem",
                  animation: "spin 1s linear infinite",
                }}
              />
              {t("reportCrime.submitting")}
            </>
          ) : (
            <>
              <FaPaperPlane style={{ marginRight: "0.5rem" }} />
              {t("reportCrime.submit")}
            </>
          )}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            animation: "fadeIn 0.3s ease",
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px 30px",
              maxWidth: "450px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              animation: "slideUp 0.3s ease",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                animation: "scaleIn 0.5s ease",
              }}
            >
              <FaCheckCircle style={{ fontSize: "40px", color: "white" }} />
            </div>

            {/* Success Message */}
            <h2
              style={{
                margin: "0 0 12px 0",
                fontSize: "24px",
                fontWeight: "700",
                color: "#1a1a2e",
              }}
            >
              Report Submitted Successfully!
            </h2>
            <p
              style={{
                margin: "0 0 30px 0",
                fontSize: "15px",
                color: "#666",
                lineHeight: "1.6",
              }}
            >
              Your {mode === "crime" ? "crime" : "complaint"} report has been
              received and will be reviewed by our team. You will be notified of
              any updates.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/user-reports");
                }}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                View My Reports
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  background: "white",
                  color: "#666",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
