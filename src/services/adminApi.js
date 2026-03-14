import { supabase } from '../lib/supabaseClient.js';

/**
 * Admin Management API Service
 * Handles all admin-related operations including user management,
 * admin creation, role management, and permissions
 */

// ============================================================================
// ADMIN USER MANAGEMENT
// ============================================================================

/**
 * Get all admin users
 * @returns {Promise<Array>} List of admin users
 */
export async function getAllAdmins() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        user_profiles!admin_users_user_id_fkey (
          email,
          full_name,
          phone_number,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch admin users');
  }
}

/**
 * Add a new admin user
 * @param {Object} adminData - Admin user data
 * @returns {Promise<Object>} Created admin user
 */
export async function addAdmin(adminData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { email, role, permissions, username, fullName } = adminData;

    // Check if the current user is a super admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new Error('Only super admins can add new admins');
    }

    // Check if user already exists in user_profiles
    let targetUserId = null;
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      targetUserId = existingProfile.user_id;
    } else {
      // Create a new user profile (they will need to complete registration)
      const tempUserId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { data: newProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: tempUserId,
          email,
          username: username || email.split('@')[0],
          full_name: fullName || '',
          role: 'user',
          is_active: true,
        })
        .select()
        .single();

      if (profileError) throw profileError;
      targetUserId = newProfile.user_id;
    }

    // Create admin record
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: targetUserId,
        email,
        username: username || email.split('@')[0],
        role: role || 'admin',
        permissions: permissions || ['view_reports', 'manage_reports'],
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505') {
        throw new Error('Admin user with this email already exists');
      }
      throw error;
    }

    // Create notification for the new admin
    await createNotification({
      userId: targetUserId,
      title: 'Admin Access Granted',
      message: `You have been granted ${role} access to the admin dashboard`,
      type: 'admin_access',
    });

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'create_admin',
      targetId: targetUserId,
      details: `Created admin user: ${email} with role: ${role}`,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to add admin user');
  }
}

/**
 * Update admin user
 * @param {string} adminId - Admin ID
 * @param {Object} updates - Updated data
 * @returns {Promise<Object>} Updated admin user
 */
export async function updateAdmin(adminId, updates) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Check if the current user is a super admin or updating themselves
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role, id')
      .eq('user_id', user.id)
      .single();

    if (!currentAdmin) {
      throw new Error('Not authorized to update admin users');
    }

    const isUpdatingSelf = currentAdmin.id === adminId;
    const isSuperAdmin = currentAdmin.role === 'super_admin';

    if (!isSuperAdmin && !isUpdatingSelf) {
      throw new Error('Only super admins can update other admin users');
    }

    // Prevent removing super admin role from themselves
    if (isUpdatingSelf && updates.role && updates.role !== 'super_admin') {
      throw new Error('Cannot remove super admin role from yourself');
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'update_admin',
      targetId: adminId,
      details: `Updated admin user with changes: ${JSON.stringify(updates)}`,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update admin user');
  }
}

/**
 * Delete admin user
 * @param {string} adminId - Admin ID
 * @returns {Promise<void>}
 */
export async function deleteAdmin(adminId) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Check if the current user is a super admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role, id')
      .eq('user_id', user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new Error('Only super admins can delete admin users');
    }

    // Prevent deleting themselves
    if (currentAdmin.id === adminId) {
      throw new Error('Cannot delete your own admin account');
    }

    // Get admin details before deletion
    const { data: adminToDelete } = await supabase
      .from('admin_users')
      .select('email, user_id')
      .eq('id', adminId)
      .single();

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);

    if (error) throw error;

    // Notify the removed admin
    if (adminToDelete) {
      await createNotification({
        userId: adminToDelete.user_id,
        title: 'Admin Access Revoked',
        message: 'Your admin access has been revoked',
        type: 'admin_access',
      });
    }

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'delete_admin',
      targetId: adminId,
      details: `Deleted admin user: ${adminToDelete?.email}`,
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to delete admin user');
  }
}

/**
 * Toggle admin active status
 * @param {string} adminId - Admin ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Updated admin user
 */
export async function toggleAdminStatus(adminId, isActive) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Check if the current user is a super admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role, id')
      .eq('user_id', user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new Error('Only super admins can toggle admin status');
    }

    // Prevent deactivating themselves
    if (currentAdmin.id === adminId && !isActive) {
      throw new Error('Cannot deactivate your own admin account');
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'toggle_admin_status',
      targetId: adminId,
      details: `${isActive ? 'Activated' : 'Deactivated'} admin user`,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to toggle admin status');
  }
}

/**
 * Check if user is admin
 * @returns {Promise<Object|null>} Admin user data or null
 */
export async function checkAdminStatus() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  } catch (error) {
    console.warn('Failed to check admin status:', error.message);
    return null;
  }
}

// ============================================================================
// USER MANAGEMENT (Admin Operations)
// ============================================================================

/**
 * Get all users (admin only)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of users
 */
export async function getAllUsers(filters = {}) {
  try {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch users');
  }
}

/**
 * Get user by ID (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user');
  }
}

/**
 * Update user (admin only)
 * @param {string} userId - User ID
 * @param {Object} updates - Updated data
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(userId, updates) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'update_user',
      targetId: userId,
      details: `Updated user with changes: ${JSON.stringify(updates)}`,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update user');
  }
}

/**
 * Toggle user active status (admin only)
 * @param {string} userId - User ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Updated user
 */
export async function toggleUserStatus(userId, isActive) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Notify the user
    await createNotification({
      userId,
      title: isActive ? 'Account Activated' : 'Account Deactivated',
      message: isActive
        ? 'Your account has been activated'
        : 'Your account has been deactivated. Please contact support for assistance.',
      type: 'account_status',
    });

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'toggle_user_status',
      targetId: userId,
      details: `${isActive ? 'Activated' : 'Deactivated'} user account`,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to toggle user status');
  }
}

/**
 * Delete user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Get user details before deletion
    const { data: userToDelete } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('user_id', userId)
      .single();

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'delete_user',
      targetId: userId,
      details: `Deleted user: ${userToDelete?.email}`,
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to delete user');
  }
}

/**
 * Get user statistics (admin only)
 * @returns {Promise<Object>} User statistics
 */
export async function getUserStatistics() {
  try {
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: inactiveUsers },
      { count: newUsersThisMonth },
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', false),
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      inactiveUsers: inactiveUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user statistics');
  }
}

// ============================================================================
// PERMISSIONS MANAGEMENT
// ============================================================================

/**
 * Get admin permissions
 * @param {string} adminId - Admin ID
 * @returns {Promise<Array>} List of permissions
 */
export async function getAdminPermissions(adminId) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('permissions, role')
      .eq('id', adminId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch permissions');
  }
}

/**
 * Update admin permissions
 * @param {string} adminId - Admin ID
 * @param {Array<string>} permissions - New permissions array
 * @returns {Promise<Object>} Updated admin user
 */
export async function updateAdminPermissions(adminId, permissions) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Check if the current user is a super admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new Error('Only super admins can update permissions');
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update({
        permissions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adminId)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'update_permissions',
      targetId: adminId,
      details: `Updated permissions: ${permissions.join(', ')}`,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update permissions');
  }
}

/**
 * Check if admin has specific permission
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} Whether admin has permission
 */
export async function hasPermission(permission) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_users')
      .select('permissions, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !data) return false;

    // Super admins have all permissions
    if (data.role === 'super_admin') return true;

    // Check if permission exists in array
    return data.permissions && data.permissions.includes(permission);
  } catch (error) {
    console.warn('Failed to check permission:', error.message);
    return false;
  }
}

// ============================================================================
// BROADCAST MESSAGES
// ============================================================================

/**
 * Send broadcast message to users
 * @param {Object} messageData - Message data
 * @returns {Promise<void>}
 */
export async function sendBroadcastMessage(messageData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { title, message, type, targetGroup } = messageData;

    // Get target users based on group
    let targetUsers = [];
    if (targetGroup === 'all') {
      const { data } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('is_active', true);
      targetUsers = data || [];
    } else if (targetGroup === 'admins') {
      const { data } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('is_active', true);
      targetUsers = data || [];
    } else if (targetGroup === 'users') {
      const { data } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('is_active', true);

      const { data: admins } = await supabase
        .from('admin_users')
        .select('user_id');

      const adminIds = (admins || []).map(a => a.user_id);
      targetUsers = (data || []).filter(u => !adminIds.includes(u.user_id));
    }

    // Create notifications for all target users
    const notifications = targetUsers.map(u => ({
      user_id: u.user_id,
      title,
      message,
      type: type || 'announcement',
      read: false,
    }));

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      await supabase.from('notifications').insert(batch);
    }

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'broadcast_message',
      details: `Sent broadcast to ${targetGroup}: "${title}" to ${notifications.length} users`,
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to send broadcast message');
  }
}

// ============================================================================
// ADMIN ACTIVITY LOGS
// ============================================================================

/**
 * Log admin action
 * @param {Object} logData - Log data
 * @returns {Promise<void>}
 */
async function logAdminAction(logData) {
  try {
    await supabase.from('admin_activity_logs').insert({
      admin_id: logData.adminId,
      action: logData.action,
      target_id: logData.targetId || null,
      details: logData.details || '',
      ip_address: null, // Can be populated if needed
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  } catch (error) {
    console.warn('Failed to log admin action:', error.message);
  }
}

/**
 * Get admin activity logs
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of activity logs
 */
export async function getAdminActivityLogs(filters = {}) {
  try {
    let query = supabase
      .from('admin_activity_logs')
      .select(`
        *,
        admin_users!admin_activity_logs_admin_id_fkey (
          email,
          username,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch activity logs');
  }
}

// ============================================================================
// NOTIFICATIONS HELPER
// ============================================================================

/**
 * Create notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<void>}
 */
async function createNotification(notificationData) {
  try {
    await supabase.from('notifications').insert({
      user_id: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      reference_id: notificationData.referenceId || null,
      read: false,
    });
  } catch (error) {
    console.warn('Failed to create notification:', error.message);
  }
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

/**
 * Get system settings
 * @returns {Promise<Object>} System settings
 */
export async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return {
          maintenance_mode: false,
          allow_registrations: true,
          require_email_verification: true,
          max_reports_per_user: 100,
          auto_archive_days: 365,
        };
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch system settings');
  }
}

/**
 * Update system settings
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateSystemSettings(settings) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Check if the current user is a super admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new Error('Only super admins can update system settings');
    }

    // Try to update existing settings or insert new ones
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        id: 1, // Use a fixed ID for singleton settings
        ...settings,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'update_system_settings',
      details: `Updated system settings: ${JSON.stringify(settings)}`,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update system settings');
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk delete users
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<void>}
 */
export async function bulkDeleteUsers(userIds) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .in('user_id', userIds);

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'bulk_delete_users',
      details: `Deleted ${userIds.length} users`,
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to bulk delete users');
  }
}

/**
 * Bulk update user status
 * @param {Array<string>} userIds - Array of user IDs
 * @param {boolean} isActive - Active status
 * @returns {Promise<void>}
 */
export async function bulkUpdateUserStatus(userIds, isActive) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .in('user_id', userIds);

    if (error) throw error;

    // Log the action
    await logAdminAction({
      adminId: user.id,
      action: 'bulk_update_user_status',
      details: `${isActive ? 'Activated' : 'Deactivated'} ${userIds.length} users`,
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to bulk update user status');
  }
}

// ============================================================================
// EXPORT ALL AVAILABLE PERMISSIONS
// ============================================================================

export const PERMISSIONS = {
  VIEW_REPORTS: 'view_reports',
  MANAGE_REPORTS: 'manage_reports',
  DELETE_REPORTS: 'delete_reports',
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  DELETE_USERS: 'delete_users',
  VIEW_ADMINS: 'view_admins',
  MANAGE_ADMINS: 'manage_admins',
  DELETE_ADMINS: 'delete_admins',
  SEND_BROADCASTS: 'send_broadcasts',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
};

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  VIEWER: 'viewer',
};
