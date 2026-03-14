import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";

export function PendingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Get pending crime reports
      const { data: crimeReports, error: _crimeError } = await supabase
        .from("crime_reports")
        .select(
          `
          *,
          user:user_id (
            email
          )
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // Get pending missing persons
      const { data: missingPersons, error: _missingError } = await supabase
        .from("missing_persons")
        .select(
          `
          *,
          user:user_id (
            email
          )
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      // Get pending missing property
      const { data: missingProperty, error: _propertyError } = await supabase
        .from("missing_property")
        .select(
          `
          *,
          user:user_id (
            email
          )
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const allRequests = [
        ...(crimeReports || []).map((r) => ({ ...r, type: "crime_report" })),
        ...(missingPersons || []).map((r) => ({
          ...r,
          type: "missing_person",
        })),
        ...(missingProperty || []).map((r) => ({
          ...r,
          type: "missing_property",
        })),
      ];

      setRequests(allRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (request, newStatus) => {
    setUpdating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const tableName =
        request.type === "crime_report"
          ? "crime_reports"
          : request.type === "missing_person"
            ? "missing_persons"
            : "missing_property";

      const updateData = {
        status: newStatus,
        admin_notes: adminNotes.trim() || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", request.id);

      if (error) throw error;

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: request.user_id,
        title: `Request ${newStatus}`,
        message: `Your ${request.type.replace("_", " ")} request has been ${newStatus}.`,
        type: newStatus === "resolved" ? "success" : "info",
      });

      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getRequestTitle = (request) => {
    if (request.type === "crime_report")
      return `${request.type} - ${request.category}`;
    if (request.type === "missing_person")
      return `Missing Person: ${request.name}`;
    if (request.type === "missing_property")
      return `Missing Property: ${request.item_name}`;
    return "Request";
  };

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">
        <FaClipboardList style={{ marginRight: "0.5rem", display: "inline" }} />
        Pending Requests
      </h2>
      <p className="rc-page-subtitle">
        Review and respond to user-submitted requests.
      </p>

      {loading ? (
        <p className="rc-hint">Loading requests...</p>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {requests.map((request) => (
            <div
              key={`${request.type}-${request.id}`}
              className="rc-card"
              style={{ padding: "1rem 1.25rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="rc-card-title">
                    {getRequestTitle(request)}
                  </div>
                  <p
                    className="rc-card-description"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {request.description || request.notes || "No description"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}
                  >
                    {request.location && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <FaMapMarkerAlt style={{ fontSize: "0.75rem" }} />
                        {request.location}
                      </span>
                    )}
                    {request.date && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <FaCalendarAlt style={{ fontSize: "0.75rem" }} />
                        {new Date(request.date).toLocaleDateString()}
                      </span>
                    )}
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FaFileAlt style={{ fontSize: "0.75rem" }} />
                      {request.type.replace("_", " ")}
                    </span>
                  </div>
                  <p
                    className="rc-card-description"
                    style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}
                  >
                    Submitted: {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="rc-icon-button"
                    title="View details"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <p className="rc-hint">No pending requests.</p>
          )}
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            className="rc-auth-card"
            style={{ maxWidth: "600px", maxHeight: "90vh", overflow: "auto" }}
          >
            <h3 style={{ marginBottom: "1rem" }}>
              {getRequestTitle(selectedRequest)}
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <strong>Description:</strong>
              <p style={{ marginTop: "0.25rem" }}>
                {selectedRequest.description || selectedRequest.notes || "N/A"}
              </p>
            </div>

            <label className="rc-field-label">
              Admin Notes
              <textarea
                className="rc-textarea"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this request..."
                rows={4}
              />
            </label>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => updateRequestStatus(selectedRequest, "resolved")}
                className="rc-primary-button"
                disabled={updating}
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                }}
              >
                <FaCheckCircle style={{ marginRight: "0.5rem" }} />
                Approve
              </button>
              <button
                type="button"
                onClick={() => updateRequestStatus(selectedRequest, "rejected")}
                className="rc-primary-button"
                disabled={updating}
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                }}
              >
                <FaTimesCircle style={{ marginRight: "0.5rem" }} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminNotes("");
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
