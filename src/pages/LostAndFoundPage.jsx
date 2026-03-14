import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  FaSearch,
  FaBox,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPlus,
  FaTimes,
  FaPaperPlane,
  FaTag,
  FaFileAlt,
} from "react-icons/fa";

const STATUS_COLORS = {
  lost: { bg: "#fee2e2", text: "#dc2626", label: "Lost" },
  found: { bg: "#d1fae5", text: "#065f46", label: "Found" },
  claimed: { bg: "#dbeafe", text: "#1d4ed8", label: "Claimed" },
};

export function LostAndFoundPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  // Form state
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("lost");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lost_found_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching items:", error);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("lost-found-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lost_found_items" },
        () => fetchItems(),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!user) {
      setFormError(t("common.notAuthenticated"));
      return;
    }
    if (!itemName.trim() || !location.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("lost_found_items").insert({
        item_name: itemName.trim(),
        category: category || "other",
        location: location.trim(),
        description: description.trim(),
        status,
        user_id: user.id,
      });

      if (error) throw error;

      // Reset form
      setItemName("");
      setCategory("");
      setLocation("");
      setDescription("");
      setStatus("lost");
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (err) {
      setFormError(err?.message ?? t("common.unknownError"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemName("");
    setCategory("");
    setLocation("");
    setDescription("");
    setStatus("lost");
    setFormError("");
    setFormSuccess(false);
    setShowForm(false);
  };

  // Filtered items
  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.item_name || "").toLowerCase().includes(q) ||
      (item.location || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="rc-page-container">
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 className="rc-page-title">
            <FaSearch style={{ marginRight: "0.5rem", display: "inline" }} />
            {t("lostAndFound.title")}
          </h2>
          <p className="rc-page-subtitle">{t("lostAndFound.subtitle")}</p>
        </div>

        {user && (
          <button
            type="button"
            className="rc-primary-button"
            style={{
              marginTop: 0,
              paddingTop: "0.6rem",
              paddingBottom: "0.6rem",
            }}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? (
              <>
                <FaTimes style={{ marginRight: "0.4rem" }} />
                {t("common.cancel")}
              </>
            ) : (
              <>
                <FaPlus style={{ marginRight: "0.4rem" }} />
                {t("lostAndFound.reportItem")}
              </>
            )}
          </button>
        )}
      </div>

      {/* Submission form */}
      {showForm && (
        <div
          className="rc-card"
          style={{
            marginBottom: "1.5rem",
            padding: "1.25rem 1.5rem",
            background:
              "linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)",
            border: "1px solid rgba(102,126,234,0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("lostAndFound.form.title")}
          </h3>

          {formSuccess && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "#d1fae5",
                color: "#065f46",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              {t("lostAndFound.form.successMessage")}
            </div>
          )}

          {formError && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              {formError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rc-form"
            style={{ maxWidth: "100%" }}
          >
            {/* Two-column grid for wider screens */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "0.85rem",
              }}
            >
              {/* Item Name */}
              <label className="rc-field-label">
                <FaBox style={{ marginRight: "0.4rem", display: "inline" }} />
                {t("lostAndFound.form.itemName")}
                <input
                  className="rc-input"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={t("lostAndFound.form.itemNamePlaceholder")}
                  required
                  disabled={submitting}
                />
              </label>

              {/* Category */}
              <label className="rc-field-label">
                <FaTag style={{ marginRight: "0.4rem", display: "inline" }} />
                {t("lostAndFound.form.category")}
                <select
                  className="rc-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">
                    {t("lostAndFound.form.selectCategory")}
                  </option>
                  <option value="electronics">
                    {t("lostAndFound.form.catElectronics")}
                  </option>
                  <option value="documents">
                    {t("lostAndFound.form.catDocuments")}
                  </option>
                  <option value="clothing">
                    {t("lostAndFound.form.catClothing")}
                  </option>
                  <option value="jewellery">
                    {t("lostAndFound.form.catJewellery")}
                  </option>
                  <option value="bag">{t("lostAndFound.form.catBag")}</option>
                  <option value="other">
                    {t("lostAndFound.form.catOther")}
                  </option>
                </select>
              </label>

              {/* Location */}
              <label className="rc-field-label">
                <FaMapMarkerAlt
                  style={{ marginRight: "0.4rem", display: "inline" }}
                />
                {t("lostAndFound.form.location")}
                <input
                  className="rc-input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("lostAndFound.form.locationPlaceholder")}
                  required
                  disabled={submitting}
                />
              </label>

              {/* Status */}
              <label className="rc-field-label">
                <FaTag style={{ marginRight: "0.4rem", display: "inline" }} />
                {t("lostAndFound.form.status")}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.35rem",
                  }}
                >
                  {["lost", "found"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: "0.6rem",
                        borderRadius: "0.75rem",
                        border: `2px solid ${status === s ? STATUS_COLORS[s].text : "#e5e7eb"}`,
                        background:
                          status === s ? STATUS_COLORS[s].bg : "#f9fafb",
                        color: status === s ? STATUS_COLORS[s].text : "#6b7280",
                        fontWeight: status === s ? 700 : 500,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        transition: "all 0.2s",
                        textTransform: "capitalize",
                      }}
                    >
                      {s === "lost"
                        ? t("lostAndFound.form.statusLost")
                        : t("lostAndFound.form.statusFound")}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* Description – full width */}
            <label className="rc-field-label" style={{ marginTop: "0.25rem" }}>
              <FaFileAlt style={{ marginRight: "0.4rem", display: "inline" }} />
              {t("lostAndFound.form.description")}
              <textarea
                className="rc-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("lostAndFound.form.descriptionPlaceholder")}
                required
                disabled={submitting}
                rows={3}
              />
            </label>

            {/* Buttons */}
            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              <button
                type="submit"
                className="rc-primary-button"
                disabled={submitting}
                style={{ marginTop: 0 }}
              >
                {submitting ? (
                  <>
                    <span
                      className="rc-spinner"
                      style={{ marginRight: "0.5rem" }}
                    />
                    {t("lostAndFound.form.submitting")}
                  </>
                ) : (
                  <>
                    <FaPaperPlane style={{ marginRight: "0.5rem" }} />
                    {t("lostAndFound.form.submit")}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  !submitting && (e.currentTarget.style.background = "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  !submitting && (e.currentTarget.style.background = "#f9fafb")
                }
              >
                {t("lostAndFound.form.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guest prompt */}
      {!user && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "rgba(239,246,255,0.95)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "0.75rem",
            fontSize: "0.85rem",
            color: "#1d4ed8",
            marginBottom: "1rem",
          }}
        >
          Sign in to report a lost or found item.
        </div>
      )}

      {/* Search */}
      <div
        style={{ position: "relative", maxWidth: 480, marginBottom: "1rem" }}
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
          placeholder={t("missingPersons.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.5rem", borderRadius: 999, width: "100%" }}
        />
      </div>

      {/* Loading */}
      {loading && <p className="rc-hint">{t("lostAndFound.loading")}</p>}

      {/* Items grid */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const statusMeta =
                STATUS_COLORS[item.status] || STATUS_COLORS.lost;
              return (
                <article
                  key={item.id}
                  className="rc-card"
                  style={{ padding: "1rem 1.1rem" }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      className="rc-card-title"
                      style={{
                        margin: 0,
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <FaBox style={{ color: "#f59e0b", flexShrink: 0 }} />
                      {item.item_name || "Unnamed Item"}
                    </div>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: statusMeta.bg,
                        color: statusMeta.text,
                        whiteSpace: "nowrap",
                        marginLeft: "0.5rem",
                        textTransform: "capitalize",
                        flexShrink: 0,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Details */}
                  <p
                    className="rc-card-description"
                    style={{ marginBottom: "0.35rem" }}
                  >
                    {item.description || "No description"}
                  </p>

                  {item.category && (
                    <p
                      className="rc-card-description"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.8rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <FaTag style={{ fontSize: "0.7rem", color: "#9ca3af" }} />
                      {item.category}
                    </p>
                  )}

                  {item.location && (
                    <p
                      className="rc-card-description"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.8rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <FaMapMarkerAlt
                        style={{ fontSize: "0.7rem", color: "#9ca3af" }}
                      />
                      {item.location}
                    </p>
                  )}

                  {item.created_at && (
                    <p
                      className="rc-card-description"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                      }}
                    >
                      <FaCalendarAlt style={{ fontSize: "0.65rem" }} />
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  )}
                </article>
              );
            })
          ) : (
            <p className="rc-hint">{t("lostAndFound.noItems")}</p>
          )}
        </div>
      )}
    </div>
  );
}
