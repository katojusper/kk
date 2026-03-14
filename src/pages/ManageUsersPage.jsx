import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaTrash,
  FaSearch,
  FaBan,
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

/* ── Inline confirmation dialog ── */
function ConfirmDialog({ message, onConfirm, onCancel, danger }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        className="rc-auth-card"
        style={{
          maxWidth: 420,
          width: "100%",
          padding: "1.75rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            background: danger ? "#fee2e2" : "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          <FaExclamationTriangle
            style={{
              color: danger ? "#dc2626" : "#f59e0b",
              fontSize: "1.25rem",
            }}
          />
        </div>
        <p
          style={{
            fontSize: "0.975rem",
            color: "#374151",
            marginBottom: "1.5rem",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "999px",
              border: "none",
              background: danger
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* confirmation dialog state */
  const [dialog, setDialog] = useState(null);
  // dialog = { message, danger, onConfirm }

  useEffect(() => {
    fetchUsers();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const fetchUsers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const usersWithEmail = (data || []).map((profile) => ({
        ...profile,
        email:
          profile.email || `user_${String(profile.user_id).substring(0, 8)}`,
        last_sign_in: profile.last_login || null,
      }));

      setUsers(usersWithEmail);
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = (userId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    setDialog({
      message: `Are you sure you want to ${action} this user?`,
      danger: currentStatus,
      onConfirm: async () => {
        setDialog(null);
        try {
          const { error } = await supabase
            .from("user_profiles")
            .update({ is_active: !currentStatus })
            .eq("user_id", userId);

          if (error) throw error;
          showSuccess(`User ${action}d successfully.`);
          fetchUsers();
        } catch (err) {
          setError(`Error: ${err.message}`);
        }
      },
    });
  };

  const deleteUser = (userId) => {
    setDialog({
      message:
        "Are you sure you want to deactivate this user? To fully delete them, use the Supabase Dashboard → Authentication → Users.",
      danger: true,
      onConfirm: async () => {
        setDialog(null);
        try {
          const { error } = await supabase
            .from("user_profiles")
            .update({ is_active: false })
            .eq("user_id", userId);

          if (error) throw error;
          showSuccess(
            "User deactivated. Use Supabase Dashboard to fully delete.",
          );
          fetchUsers();
        } catch (err) {
          setError(`Error: ${err.message}`);
        }
      },
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="rc-page-container">
      {/* Confirmation dialog */}
      {dialog && (
        <ConfirmDialog
          message={dialog.message}
          danger={dialog.danger}
          onConfirm={dialog.onConfirm}
          onCancel={() => setDialog(null)}
        />
      )}

      <h2 className="rc-page-title">
        <FaUsers style={{ marginRight: "0.5rem", display: "inline" }} />
        Manage Users
      </h2>
      <p className="rc-page-subtitle">
        View, activate, deactivate, or remove user accounts.
      </p>

      {/* Error banner */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            border: "1px solid #fca5a5",
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              padding: "0.2rem",
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Success banner */}
      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            background: "#d1fae5",
            color: "#065f46",
            borderRadius: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            border: "1px solid #6ee7b7",
          }}
        >
          <FaCheck style={{ flexShrink: 0 }} />
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div
        style={{
          maxWidth: 420,
          marginBottom: "1rem",
          position: "relative",
        }}
      >
        <FaSearch
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        />
        <input
          className="rc-input"
          placeholder="Search users by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {/* User count */}
      {!loading && (
        <p className="rc-hint" style={{ marginBottom: "0.75rem" }}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
          found
        </p>
      )}

      {loading ? (
        <p className="rc-hint">Loading users...</p>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rc-card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.25rem",
                gap: "0.75rem",
              }}
            >
              {/* User info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="rc-card-title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {user.is_active ? (
                    <FaUserCheck style={{ color: "#10b981", flexShrink: 0 }} />
                  ) : (
                    <FaUserTimes style={{ color: "#ef4444", flexShrink: 0 }} />
                  )}
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.full_name || user.username || "Unnamed User"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      background: user.is_active ? "#d1fae5" : "#fee2e2",
                      color: user.is_active ? "#065f46" : "#dc2626",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p
                  className="rc-card-description"
                  style={{
                    marginTop: "0.25rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </p>

                <p
                  className="rc-card-description"
                  style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                >
                  Joined:{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                  {user.last_sign_in && (
                    <>
                      {" "}
                      &bull; Last login:{" "}
                      {new Date(user.last_sign_in).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => toggleUserActive(user.user_id, user.is_active)}
                  className="rc-icon-button"
                  style={{
                    background: user.is_active ? "#fee2e2" : "#d1fae5",
                    color: user.is_active ? "#dc2626" : "#065f46",
                  }}
                  title={user.is_active ? "Deactivate user" : "Activate user"}
                >
                  {user.is_active ? <FaBan /> : <FaCheck />}
                </button>

                <button
                  type="button"
                  onClick={() => deleteUser(user.user_id)}
                  className="rc-icon-button"
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                  }}
                  title="Deactivate / remove user"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <p className="rc-hint">No users found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
