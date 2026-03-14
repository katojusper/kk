import {
  supabase,
  TABLES,
  getCurrentUser,
  isDemoAdmin,
  getDemoUser,
} from "./supabaseClient.js";

/**
 * Check if current user is an admin.
 * Falls back to the hardcoded demo admin list when Supabase is unreachable.
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Demo / offline admin bypass
    if (user.isDemoUser) return true;
    if (isDemoAdmin(user.email)) return true;

    const { data, error } = await supabase
      .from(TABLES.adminUsers)
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    return !error && !!data;
  } catch (error) {
    console.error("[authHelpers] isAdmin error:", error.message);
    // If Supabase is unreachable, fall back to demo admin check
    try {
      const demo = getDemoUser();
      if (demo?.isDemoUser) return true;
    } catch {
      /* ignore */
    }
    return false;
  }
}

/**
 * Get full admin record for current user.
 * Returns a synthetic record for demo admin users.
 * @returns {Promise<object|null>}
 */
export async function getAdminUser() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Return synthetic admin record for demo users
    if (user.isDemoUser) {
      return {
        id: user.id,
        user_id: user.id,
        email: user.email,
        role: user.role || "super_admin",
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from(TABLES.adminUsers)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return error ? null : data;
  } catch (error) {
    console.error("[authHelpers] getAdminUser error:", error.message);
    return null;
  }
}

/**
 * Get user profile for current user.
 * @returns {Promise<object|null>}
 */
export async function getUserProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Synthetic profile for demo users
    if (user.isDemoUser) {
      return {
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.name || "Admin User",
        username: user.user_metadata?.display_name || "admin",
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from(TABLES.userProfiles)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return error ? null : data;
  } catch (error) {
    console.error("[authHelpers] getUserProfile error:", error.message);
    return null;
  }
}

/**
 * Update user profile fields for current user.
 * @param {object} updates - Fields to update
 * @returns {Promise<object>}
 */
export async function updateUserProfile(updates) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  if (user.isDemoUser) return { ...updates, user_id: user.id };

  const { data, error } = await supabase
    .from(TABLES.userProfiles)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Upsert (create or update) the user profile – safe to call on every login.
 * @param {object} fields - username, full_name, phone, email …
 * @returns {Promise<object>}
 */
export async function upsertUserProfile(fields) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  if (user.isDemoUser)
    return { user_id: user.id, email: user.email, ...fields };

  const { data, error } = await supabase
    .from(TABLES.userProfiles)
    .upsert(
      {
        user_id: user.id,
        email: user.email,
        ...fields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Send a notification to a specific user (admin-only in production via RLS).
 * @param {string} userId
 * @param {string} title
 * @param {string} message
 * @param {'info'|'success'|'warning'|'error'} type
 */
export async function sendNotification(userId, title, message, type = "info") {
  try {
    const { error } = await supabase
      .from(TABLES.notifications)
      .insert({ user_id: userId, title, message, type });

    if (error)
      console.error("[authHelpers] sendNotification error:", error.message);
  } catch (err) {
    console.error("[authHelpers] sendNotification network error:", err.message);
  }
}

/**
 * Mark all notifications as read for current user.
 */
export async function markAllNotificationsRead() {
  try {
    const user = await getCurrentUser();
    if (!user || user.isDemoUser) return;

    const { error } = await supabase
      .from(TABLES.notifications)
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) console.error("[authHelpers] markAllRead error:", error.message);
  } catch (err) {
    console.error("[authHelpers] markAllRead network error:", err.message);
  }
}
