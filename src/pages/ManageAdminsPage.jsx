import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import {
  FaUserShield,
  FaTrash,
  FaPlus,
  FaCrown,
  FaShieldAlt,
} from "react-icons/fa";

export function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select(
          `
          *,
          user:user_id (
            email,
            created_at
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    setAdding(true);
    try {
      // Find user by email in user_profiles (which stores email)
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_id, email")
        .eq("email", newAdminEmail.trim())
        .single();

      if (profileError || !userProfile) {
        alert("User with this email not found. User must sign up first.");
        setAdding(false);
        return;
      }

      // Add to admin_users table
      const { error: insertError } = await supabase.from("admin_users").insert({
        user_id: userProfile.user_id,
        email: userProfile.email,
        role: "admin",
      });

      if (insertError) {
        if (insertError.code === "23505") {
          alert("This user is already an admin");
        } else {
          throw insertError;
        }
      } else {
        setNewAdminEmail("");
        setShowAddForm(false);
        fetchAdmins();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (adminId) => {
    if (!confirm("Are you sure you want to remove this admin?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", adminId);

      if (error) throw error;
      fetchAdmins();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="rc-page-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 className="rc-page-title">
            <FaUserShield
              style={{ marginRight: "0.5rem", display: "inline" }}
            />
            Manage Admins
          </h2>
          <p className="rc-page-subtitle">Add or remove admin accounts.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rc-primary-button"
        >
          <FaPlus style={{ marginRight: "0.5rem" }} />
          Add Admin
        </button>
      </div>

      {showAddForm && (
        <div
          className="rc-card"
          style={{ marginBottom: "1rem", padding: "1rem 1.25rem" }}
        >
          <label className="rc-field-label">
            User Email
            <input
              className="rc-input"
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={adding}
            />
          </label>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button
              type="button"
              onClick={addAdmin}
              className="rc-primary-button"
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Admin"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewAdminEmail("");
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
      )}

      {loading ? (
        <p className="rc-hint">Loading admins...</p>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="rc-card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.25rem",
                background:
                  admin.role === "super_admin"
                    ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                    : undefined,
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {admin.role === "super_admin" ? (
                  <FaCrown style={{ color: "#f59e0b", fontSize: "1.25rem" }} />
                ) : (
                  <FaShieldAlt
                    style={{ color: "#667eea", fontSize: "1.25rem" }}
                  />
                )}
                <div>
                  <div className="rc-card-title">
                    {admin.email}
                    {admin.role === "super_admin" && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          fontSize: "0.75rem",
                          color: "#f59e0b",
                        }}
                      >
                        (Super Admin)
                      </span>
                    )}
                  </div>
                  <p
                    className="rc-card-description"
                    style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                  >
                    Added: {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {admin.role !== "super_admin" && (
                <button
                  type="button"
                  onClick={() => removeAdmin(admin.id)}
                  className="rc-icon-button"
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                  }}
                  title="Remove admin"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}

          {admins.length === 0 && <p className="rc-hint">No admins found.</p>}
        </div>
      )}
    </div>
  );
}
