import {
  supabase,
  getCurrentUser,
  getCurrentSession,
  signOut as supabaseSignOut,
  TABLES,
} from "../lib/supabaseClient.js";

/**
 * Sign up a new user with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @param {string} fullName
 * @returns {Promise<{user: object, error: object|null}>}
 */
export async function signUpUser(email, password, username, fullName) {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          username: username.trim(),
          display_name: username.trim(),
          full_name: fullName.trim(),
          name: fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { user: null, error };
    }

    // Create user profile in database
    if (data.user) {
      await createUserProfile(data.user.id, {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        full_name: fullName.trim(),
      });
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error("[authApi] signUpUser error:", err.message);
    return { user: null, error: err };
  }
}

/**
 * Sign in user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{session: object, user: object, error: object|null}>}
 */
export async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { session: null, user: null, error };
    }

    return {
      session: data.session,
      user: data.user,
      error: null,
    };
  } catch (err) {
    console.error("[authApi] signInUser error:", err.message);
    return { session: null, user: null, error: err };
  }
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 * @param {string} provider - 'google', 'github', etc.
 * @returns {Promise<{data: object, error: object|null}>}
 */
export async function signInWithOAuth(provider) {
  try {
    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        scopes: provider === "google" ? "profile email" : undefined,
      },
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("[authApi] signInWithOAuth error:", err.message);
    return { data: null, error: err };
  }
}

/**
 * Sign out current user
 * @returns {Promise<{error: object|null}>}
 */
export async function signOutUser() {
  try {
    await supabaseSignOut();
    return { error: null };
  } catch (err) {
    console.error("[authApi] signOutUser error:", err.message);
    return { error: err };
  }
}

/**
 * Send password reset email
 * @param {string} email
 * @returns {Promise<{error: object|null}>}
 */
export async function sendPasswordResetEmail(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      },
    );

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("[authApi] sendPasswordResetEmail error:", err.message);
    return { error: err };
  }
}

/**
 * Update user password
 * @param {string} newPassword
 * @returns {Promise<{error: object|null}>}
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("[authApi] updatePassword error:", err.message);
    return { error: err };
  }
}

/**
 * Update user email
 * @param {string} newEmail
 * @returns {Promise<{error: object|null}>}
 */
export async function updateEmail(newEmail) {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim().toLowerCase(),
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("[authApi] updateEmail error:", err.message);
    return { error: err };
  }
}

/**
 * Create user profile in database
 * @param {string} userId
 * @param {object} profileData
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createUserProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from(TABLES.userProfiles)
      .insert({
        user_id: userId,
        email: profileData.email || "",
        username: profileData.username || "",
        full_name: profileData.full_name || "",
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("[authApi] createUserProfile error:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("[authApi] createUserProfile exception:", err.message);
    return { data: null, error: err };
  }
}

/**
 * Get current user profile
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getCurrentUserProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: new Error("Not authenticated") };
    }

    const { data, error } = await supabase
      .from(TABLES.userProfiles)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[authApi] getCurrentUserProfile error:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("[authApi] getCurrentUserProfile exception:", err.message);
    return { data: null, error: err };
  }
}

/**
 * Update user profile
 * @param {object} updates
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateUserProfile(updates) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: new Error("Not authenticated") };
    }

    const { data, error } = await supabase
      .from(TABLES.userProfiles)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[authApi] updateUserProfile error:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("[authApi] updateUserProfile exception:", err.message);
    return { data: null, error: err };
  }
}

/**
 * Get current session
 * @returns {Promise<{session: object|null, user: object|null, error: object|null}>}
 */
export async function getSessionData() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { session: null, user: null, error: null };
    }

    return { session, user: session.user, error: null };
  } catch (err) {
    console.error("[authApi] getSessionData error:", err.message);
    return { session: null, user: null, error: err };
  }
}

/**
 * Verify email with OTP
 * @param {string} email
 * @param {string} token
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function verifyEmailOTP(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("[authApi] verifyEmailOTP error:", err.message);
    return { data: null, error: err };
  }
}

/**
 * Send magic link for passwordless sign in
 * @param {string} email
 * @returns {Promise<{error: object|null}>}
 */
export async function sendMagicLink(email) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("[authApi] sendMagicLink error:", err.message);
    return { error: err };
  }
}

/**
 * Check if user email is verified
 * @returns {Promise<{verified: boolean, error: object|null}>}
 */
export async function isEmailVerified() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { verified: false, error: new Error("Not authenticated") };
    }

    return { verified: !!user.email_confirmed_at, error: null };
  } catch (err) {
    console.error("[authApi] isEmailVerified error:", err.message);
    return { verified: false, error: err };
  }
}

/**
 * Refresh session
 * @returns {Promise<{session: object|null, error: object|null}>}
 */
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return { session: null, error };
    }

    return { session: data.session, error: null };
  } catch (err) {
    console.error("[authApi] refreshSession error:", err.message);
    return { session: null, error: err };
  }
}
