import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";
import {
  FaUpload,
  FaFileAlt,
  FaUser,
  FaTag,
  FaExclamationTriangle,
  FaUserTimes,
  FaBox,
} from "react-icons/fa";

export function UploadListPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, resolved, rejected

  const fetchAllReports = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all types of reports
      const [crimeReports, missingPersons, missingProperty] = await Promise.all(
        [
          supabase
            .from("crime_reports")
            .select("*, user:user_id(email)")
            .order("created_at", { ascending: false }),
          supabase
            .from("missing_persons")
            .select("*, user:user_id(email)")
            .order("created_at", { ascending: false }),
          supabase
            .from("missing_property")
            .select("*, user:user_id(email)")
            .order("created_at", { ascending: false }),
        ],
      );

      let allReports = [
        ...(crimeReports.data || []).map((r) => ({
          ...r,
          reportType: "Crime Report",
          icon: FaExclamationTriangle,
        })),
        ...(missingPersons.data || []).map((r) => ({
          ...r,
          reportType: "Missing Person",
          icon: FaUserTimes,
        })),
        ...(missingProperty.data || []).map((r) => ({
          ...r,
          reportType: "Missing Property",
          icon: FaBox,
        })),
      ];

      // Apply filter
      if (filter !== "all") {
        allReports = allReports.filter((r) => r.status === filter);
      }

      setReports(allReports);
      setError(null);
    } catch (err) {
      setError(err?.message ?? "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "resolved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "active":
        return "#3b82f6";
      case "found":
        return "#10b981";
      case "closed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">
        <FaUpload style={{ marginRight: "0.5rem", display: "inline" }} />
        All Reports
      </h2>
      <p className="rc-page-subtitle">
        View all submitted reports, missing persons, and property.
      </p>

      {/* Filter Buttons */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1rem",
          flexWrap: "wrap",
        }}
      >
        {["all", "pending", "resolved", "rejected", "active"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background:
                filter === f
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#f9fafb",
              color: filter === f ? "#fff" : "#111827",
              cursor: "pointer",
              textTransform: "capitalize",
              fontSize: "0.875rem",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="rc-hint">Loading reports…</p>}
      {error && (
        <p className="rc-hint" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 10,
          marginTop: 12,
        }}
      >
        {reports.map((report, idx) => {
          const IconComponent = report.icon || FaFileAlt;
          return (
            <article
              key={report.id ?? idx}
              className="rc-card"
              style={{ padding: "1rem 1.25rem" }}
            >
              <div
                style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                  }}
                >
                  <IconComponent />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    className="rc-card-title"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {report.reportType}
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        background: getStatusColor(report.status),
                        color: "#fff",
                        textTransform: "capitalize",
                      }}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p
                    className="rc-card-description"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {report.description || report.notes || "No description"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      flexWrap: "wrap",
                    }}
                  >
                    {report.location && (
                      <span>
                        <strong>Location:</strong> {report.location}
                      </span>
                    )}
                    {report.category && (
                      <span>
                        <strong>Category:</strong> {report.category}
                      </span>
                    )}
                    {report.name && (
                      <span>
                        <strong>Name:</strong> {report.name}
                      </span>
                    )}
                    {report.item_name && (
                      <span>
                        <strong>Item:</strong> {report.item_name}
                      </span>
                    )}
                    <span>
                      <strong>Date:</strong>{" "}
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {report.admin_notes && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        background: "#f3f4f6",
                        borderRadius: "0.25rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <strong>Admin Notes:</strong> {report.admin_notes}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {!loading && !error && reports.length === 0 && (
          <p className="rc-hint">No reports found.</p>
        )}
      </div>
    </div>
  );
}
