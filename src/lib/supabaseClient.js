import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase client configuration
// ---------------------------------------------------------------------------
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://oxjwrmxmhuegjcvrctvp.supabase.co";

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if Supabase is properly configured
const isSupabaseConfigured = !!(
  supabaseAnonKey &&
  supabaseAnonKey !== "your-anon-key-here" &&
  supabaseAnonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️  [ReportCrime] Supabase is not properly configured!\n\n" +
      "To fix this:\n" +
      "1. Create a .env file in the project root\n" +
      "2. Add the following:\n" +
      "   VITE_SUPABASE_URL=https://oxjwrmxmhuegjcvrctvp.supabase.co\n" +
      "   VITE_SUPABASE_ANON_KEY=eyJ... (your actual key)\n" +
      "3. Get your key from: https://app.supabase.com/project/_/settings/api\n" +
      "4. Restart the dev server: npm run dev\n\n" +
      "📌 Demo mode is active – admin login with jusperkato@gmail.com / admon@123 will work for testing.",
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "demo-key-placeholder",
  {
    auth: {
      flowType: "pkce",
      redirectTo:
        import.meta.env.VITE_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : ""),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

// ---------------------------------------------------------------------------
// Connection Status Checker
// ---------------------------------------------------------------------------
let connectionStatus = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Check if Supabase is reachable
 * @returns {Promise<boolean>}
 */
export async function isSupabaseReachable() {
  const now = Date.now();

  // Return cached result if recent
  if (connectionStatus !== null && now - lastCheckTime < CACHE_DURATION) {
    return connectionStatus;
  }

  if (!isSupabaseConfigured) {
    connectionStatus = false;
    lastCheckTime = now;
    return false;
  }

  try {
    // Try to get session (quick check)
    const { error } = await supabase.auth.getSession();
    connectionStatus = !error;
    lastCheckTime = now;
    return connectionStatus;
  } catch {
    connectionStatus = false;
    lastCheckTime = now;
    return false;
  }
}

/**
 * Get connection status message
 * @returns {string}
 */
export function getConnectionMessage() {
  if (!isSupabaseConfigured) {
    return "Supabase is not configured. Please add your VITE_SUPABASE_ANON_KEY to .env file.";
  }
  if (connectionStatus === false) {
    return "Cannot reach the server. Please check your internet connection or Supabase configuration.";
  }
  return "";
}

// ---------------------------------------------------------------------------
// Demo / Offline Admin Credentials
// Used as a fallback when Supabase is not reachable or anon key is missing.
// ---------------------------------------------------------------------------
const DEMO_ADMINS = [
  {
    email: "jusperkato@gmail.com",
    password: "admon@123",
    role: "super_admin",
    name: "Jusper Kato",
  },
];

const DEMO_SESSION_KEY = "rc_demo_session";
const DEMO_USERS_KEY = "rc_demo_users"; // Store demo users

/**
 * Get all demo users from localStorage
 */
function getDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save demo users to localStorage
 */
function saveDemoUsers(users) {
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save demo users:", err);
  }
}

/**
 * Add a demo user
 */
export function addDemoUser(email, password, username) {
  const users = getDemoUsers();
  const existingUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const newUser = {
    id: `demo-user-${Date.now()}`,
    email: email.toLowerCase(),
    password,
    username,
    role: "user",
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveDemoUsers(users);
  return newUser;
}

/**
 * Attempt a demo (offline) login.
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object, isAdmin: boolean } | null}
 */
export function tryDemoLogin(email, password) {
  const emailLower = email.toLowerCase();

  // Check admin first
  const adminMatch = DEMO_ADMINS.find(
    (a) => a.email.toLowerCase() === emailLower && a.password === password,
  );

  if (adminMatch) {
    const demoUser = {
      id: `demo-${adminMatch.email}`,
      email: adminMatch.email,
      user_metadata: {
        name: adminMatch.name,
        display_name: adminMatch.name,
        username: adminMatch.name,
      },
      role: adminMatch.role,
      isDemoUser: true,
    };
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    return { user: demoUser, isAdmin: true };
  }

  // Check regular demo users
  const demoUsers = getDemoUsers();
  const userMatch = demoUsers.find(
    (u) => u.email === emailLower && u.password === password,
  );

  if (userMatch) {
    const demoUser = {
      id: userMatch.id,
      email: userMatch.email,
      user_metadata: {
        name: userMatch.username,
        display_name: userMatch.username,
        username: userMatch.username,
      },
      role: userMatch.role,
      isDemoUser: true,
    };
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    return { user: demoUser, isAdmin: false };
  }

  return null;
}

/**
 * Get the currently stored demo user session (if any).
 * @returns {object|null}
 */
export function getDemoUser() {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear demo user session (logout).
 */
export function clearDemoUser() {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

/**
 * Check if a given email belongs to a hardcoded demo admin.
 * @param {string} email
 * @returns {boolean}
 */
export function isDemoAdmin(email) {
  return DEMO_ADMINS.some(
    (a) => a.email.toLowerCase() === email?.toLowerCase(),
  );
}

// ---------------------------------------------------------------------------
// Convenience helpers with better error handling
// ---------------------------------------------------------------------------

/**
 * Returns the currently authenticated Supabase user OR the demo user, or null.
 */
export async function getCurrentUser() {
  // Check demo session first
  const demo = getDemoUser();
  if (demo) return demo;

  // Check if Supabase is reachable
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("[supabase] getUser error:", error.message);
      return null;
    }
    return user;
  } catch (err) {
    console.error("[supabase] getUser exception:", err.message);
    return null;
  }
}

/**
 * Returns the current session, or null.
 */
export async function getCurrentSession() {
  const demo = getDemoUser();
  if (demo) return { user: demo, isDemoSession: true };

  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("[supabase] getSession error:", error.message);
      return null;
    }
    return session;
  } catch (err) {
    console.error("[supabase] getSession exception:", err.message);
    return null;
  }
}

/**
 * Signs the user out (Supabase + demo).
 */
export async function signOut() {
  clearDemoUser();

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[supabase] signOut error:", error.message);
  } catch (err) {
    console.error("[supabase] signOut exception:", err.message);
  }
}

/**
 * Safe Supabase operation wrapper
 * @param {Function} operation - Async function to execute
 * @param {*} fallbackValue - Value to return if operation fails
 * @returns {Promise<*>}
 */
export async function safeSupabaseOp(operation, fallbackValue = null) {
  if (!isSupabaseConfigured) {
    console.warn("[supabase] Operation skipped - not configured");
    return fallbackValue;
  }

  try {
    return await operation();
  } catch (err) {
    console.error("[supabase] Operation failed:", err.message);
    return fallbackValue;
  }
}

// ---------------------------------------------------------------------------
// Database table names – single source of truth so a rename only touches here
// ---------------------------------------------------------------------------
export const TABLES = {
  adminUsers: "admin_users",
  userProfiles: "user_profiles",
  crimeReports: "crime_reports",
  missingPersons: "missing_persons",
  missingProperty: "missing_property",
  lostFoundItems: "lost_found_items",
  notifications: "notifications",
  messages: "messages",
};

// ---------------------------------------------------------------------------
// Storage bucket names
// ---------------------------------------------------------------------------
export const BUCKETS = {
  evidence: "evidence",
};

// ---------------------------------------------------------------------------
// Export configuration status
// ---------------------------------------------------------------------------
export { isSupabaseConfigured };
