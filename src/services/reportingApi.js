import { supabase } from '../lib/supabaseClient.js';

/**
 * Reporting API Service
 * Handles all reporting-related operations including crime reports,
 * missing persons, missing property, and general reporting submissions
 */

// ============================================================================
// CRIME REPORTS
// ============================================================================

/**
 * Submit a new crime report
 * @param {Object} reportData - Crime report data
 * @returns {Promise<Object>} Created report
 */
export async function submitCrimeReport(reportData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { type, location, date, description, category, file, latitude, longitude } = reportData;

    let fileUrl = null;

    // Upload file if provided
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `crime_reports/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);
          fileUrl = data?.publicUrl || null;
        }
      } catch (err) {
        console.warn('File upload failed:', err.message);
      }
    }

    const { data, error } = await supabase
      .from('crime_reports')
      .insert({
        type,
        location,
        date,
        description,
        category: category || 'other',
        file_url: fileUrl,
        latitude,
        longitude,
        user_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for admins
    await createAdminNotification({
      title: 'New Crime Report',
      message: `A new ${type} report has been submitted in ${location}`,
      type: 'crime_report',
      reference_id: data.id,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to submit crime report');
  }
}

/**
 * Get all crime reports (admin only)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of crime reports
 */
export async function getAllCrimeReports(filters = {}) {
  try {
    let query = supabase
      .from('crime_reports')
      .select(`
        *,
        user_profiles!crime_reports_user_id_fkey (
          email,
          full_name,
          phone_number
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.fromDate) {
      query = query.gte('date', filters.fromDate);
    }
    if (filters.toDate) {
      query = query.lte('date', filters.toDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch crime reports');
  }
}

/**
 * Get user's own crime reports
 * @returns {Promise<Array>} List of user's crime reports
 */
export async function getMyCrimeReports() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('crime_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch reports');
  }
}

/**
 * Update crime report status (admin only)
 * @param {string} reportId - Report ID
 * @param {string} status - New status (pending, resolved, rejected, under_investigation)
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise<Object>} Updated report
 */
export async function updateCrimeReportStatus(reportId, status, adminNotes = '') {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('crime_reports')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    // Notify the user about status change
    await createUserNotification({
      userId: data.user_id,
      title: 'Report Status Updated',
      message: `Your crime report has been ${status}`,
      type: 'status_update',
      reference_id: reportId,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update report status');
  }
}

/**
 * Delete crime report
 * @param {string} reportId - Report ID
 * @returns {Promise<void>}
 */
export async function deleteCrimeReport(reportId) {
  try {
    const { error } = await supabase
      .from('crime_reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete report');
  }
}

// ============================================================================
// MISSING PERSONS
// ============================================================================

/**
 * Submit missing person report
 * @param {Object} reportData - Missing person data
 * @returns {Promise<Object>} Created report
 */
export async function submitMissingPersonReport(reportData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { name, age, gender, lastSeenLocation, lastSeenDate, description, contactInfo, photo, height, weight } = reportData;

    let photoUrl = null;

    // Upload photo if provided
    if (photo) {
      try {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `missing_persons/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, photo);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);
          photoUrl = data?.publicUrl || null;
        }
      } catch (err) {
        console.warn('Photo upload failed:', err.message);
      }
    }

    const { data, error } = await supabase
      .from('missing_persons')
      .insert({
        name,
        age,
        gender,
        last_seen_location: lastSeenLocation,
        last_seen_date: lastSeenDate,
        description,
        contact_info: contactInfo,
        photo_url: photoUrl,
        height,
        weight,
        user_id: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for admins
    await createAdminNotification({
      title: 'New Missing Person Report',
      message: `Missing person report for ${name} has been submitted`,
      type: 'missing_person',
      reference_id: data.id,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to submit missing person report');
  }
}

/**
 * Get all missing persons reports
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of missing persons
 */
export async function getAllMissingPersons(filters = {}) {
  try {
    let query = supabase
      .from('missing_persons')
      .select(`
        *,
        user_profiles!missing_persons_user_id_fkey (
          email,
          full_name,
          phone_number
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch missing persons');
  }
}

/**
 * Update missing person status
 * @param {string} reportId - Report ID
 * @param {string} status - New status (active, found, closed)
 * @returns {Promise<Object>} Updated report
 */
export async function updateMissingPersonStatus(reportId, status) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('missing_persons')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    // Notify the reporter
    await createUserNotification({
      userId: data.user_id,
      title: 'Missing Person Status Updated',
      message: `Missing person report status has been updated to ${status}`,
      type: 'status_update',
      reference_id: reportId,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update status');
  }
}

// ============================================================================
// MISSING PROPERTY
// ============================================================================

/**
 * Submit missing property report
 * @param {Object} reportData - Missing property data
 * @returns {Promise<Object>} Created report
 */
export async function submitMissingPropertyReport(reportData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { itemName, category, lastSeenLocation, dateLost, description, photo, serialNumber, estimatedValue } = reportData;

    let photoUrl = null;

    // Upload photo if provided
    if (photo) {
      try {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `missing_property/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, photo);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);
          photoUrl = data?.publicUrl || null;
        }
      } catch (err) {
        console.warn('Photo upload failed:', err.message);
      }
    }

    const { data, error } = await supabase
      .from('missing_property')
      .insert({
        item_name: itemName,
        category: category || 'other',
        last_seen_location: lastSeenLocation,
        date_lost: dateLost,
        description,
        photo_url: photoUrl,
        serial_number: serialNumber,
        estimated_value: estimatedValue,
        user_id: user.id,
        status: 'lost',
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for admins
    await createAdminNotification({
      title: 'New Missing Property Report',
      message: `Missing property report for ${itemName} has been submitted`,
      type: 'missing_property',
      reference_id: data.id,
    });

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to submit missing property report');
  }
}

/**
 * Get all missing property reports
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of missing properties
 */
export async function getAllMissingProperty(filters = {}) {
  try {
    let query = supabase
      .from('missing_property')
      .select(`
        *,
        user_profiles!missing_property_user_id_fkey (
          email,
          full_name,
          phone_number
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch missing property');
  }
}

// ============================================================================
// GENERAL REPORTING (Uploads/Reports)
// ============================================================================

/**
 * Submit a general report/upload
 * @param {Object} reportData - General report data
 * @returns {Promise<Object>} Created report
 */
export async function submitGeneralReport(reportData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { title, description, category, files } = reportData;

    let fileUrls = [];

    // Upload files if provided
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `general_reports/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);

          if (!uploadError) {
            const { data } = supabase.storage
              .from('evidence')
              .getPublicUrl(filePath);
            if (data?.publicUrl) {
              fileUrls.push(data.publicUrl);
            }
          }
        } catch (err) {
          console.warn('File upload failed:', err.message);
        }
      }
    }

    const { data, error } = await supabase
      .from('uploads')
      .insert({
        title,
        description,
        category,
        file_urls: fileUrls,
        user_id: user.id,
        status: 'pending',
        reported_by_type: 'user',
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to submit report');
  }
}

/**
 * Get all general reports (admin only)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of reports
 */
export async function getAllGeneralReports(filters = {}) {
  try {
    let query = supabase
      .from('uploads')
      .select(`
        *,
        user_profiles!uploads_user_id_fkey (
          email,
          full_name,
          phone_number
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch reports');
  }
}

/**
 * Update general report status
 * @param {string} reportId - Report ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated report
 */
export async function updateGeneralReportStatus(reportId, status) {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update report status');
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Create notification for admins
 * @param {Object} notificationData - Notification data
 * @returns {Promise<void>}
 */
async function createAdminNotification(notificationData) {
  try {
    // Get all admin users
    const { data: admins } = await supabase
      .from('admin_users')
      .select('user_id');

    if (!admins || admins.length === 0) return;

    // Create notification for each admin
    const notifications = admins.map(admin => ({
      user_id: admin.user_id,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      reference_id: notificationData.reference_id,
      read: false,
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.warn('Failed to create admin notifications:', error.message);
  }
}

/**
 * Create notification for a specific user
 * @param {Object} notificationData - Notification data
 * @returns {Promise<void>}
 */
async function createUserNotification(notificationData) {
  try {
    await supabase.from('notifications').insert({
      user_id: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      reference_id: notificationData.reference_id,
      read: false,
    });
  } catch (error) {
    console.warn('Failed to create user notification:', error.message);
  }
}

/**
 * Get user notifications
 * @param {number} limit - Number of notifications to fetch
 * @returns {Promise<Array>} List of notifications
 */
export async function getUserNotifications(limit = 50) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch notifications');
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    throw new Error(error.message || 'Failed to mark notification as read');
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export async function markAllNotificationsAsRead() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    throw new Error(error.message || 'Failed to mark all notifications as read');
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get reporting statistics (admin only)
 * @returns {Promise<Object>} Statistics object
 */
export async function getReportingStatistics() {
  try {
    const [
      { count: totalCrimeReports },
      { count: pendingCrimeReports },
      { count: resolvedCrimeReports },
      { count: totalMissingPersons },
      { count: activeMissingPersons },
      { count: totalMissingProperty },
      { count: totalGeneralReports },
    ] = await Promise.all([
      supabase.from('crime_reports').select('*', { count: 'exact', head: true }),
      supabase.from('crime_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('crime_reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabase.from('missing_persons').select('*', { count: 'exact', head: true }),
      supabase.from('missing_persons').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('missing_property').select('*', { count: 'exact', head: true }),
      supabase.from('uploads').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalCrimeReports: totalCrimeReports || 0,
      pendingCrimeReports: pendingCrimeReports || 0,
      resolvedCrimeReports: resolvedCrimeReports || 0,
      totalMissingPersons: totalMissingPersons || 0,
      activeMissingPersons: activeMissingPersons || 0,
      totalMissingProperty: totalMissingProperty || 0,
      totalGeneralReports: totalGeneralReports || 0,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch statistics');
  }
}

/**
 * Get reports by category
 * @returns {Promise<Array>} Category statistics
 */
export async function getReportsByCategory() {
  try {
    const { data, error } = await supabase
      .from('crime_reports')
      .select('category');

    if (error) throw error;

    // Count reports by category
    const categoryCounts = {};
    (data || []).forEach(report => {
      const cat = report.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch category statistics');
  }
}

/**
 * Get recent activity feed
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} List of recent activities
 */
export async function getRecentActivity(limit = 20) {
  try {
    const [crimeReports, missingPersons, missingProperty] = await Promise.all([
      supabase
        .from('crime_reports')
        .select('id, type, category, created_at, status')
        .order('created_at', { ascending: false })
        .limit(limit / 3),
      supabase
        .from('missing_persons')
        .select('id, name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(limit / 3),
      supabase
        .from('missing_property')
        .select('id, item_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(limit / 3),
    ]);

    const activities = [
      ...(crimeReports.data || []).map(r => ({
        ...r,
        type: 'crime_report',
        title: `Crime Report: ${r.type}`,
      })),
      ...(missingPersons.data || []).map(r => ({
        ...r,
        type: 'missing_person',
        title: `Missing Person: ${r.name}`,
      })),
      ...(missingProperty.data || []).map(r => ({
        ...r,
        type: 'missing_property',
        title: `Missing Property: ${r.item_name}`,
      })),
    ];

    // Sort by created_at
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return activities.slice(0, limit);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch recent activity');
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk update report statuses
 * @param {Array<string>} reportIds - Array of report IDs
 * @param {string} status - New status
 * @param {string} table - Table name
 * @returns {Promise<void>}
 */
export async function bulkUpdateReportStatus(reportIds, status, table = 'crime_reports') {
  try {
    const { error } = await supabase
      .from(table)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', reportIds);

    if (error) throw error;
  } catch (error) {
    throw new Error(error.message || 'Failed to bulk update reports');
  }
}

/**
 * Bulk delete reports
 * @param {Array<string>} reportIds - Array of report IDs
 * @param {string} table - Table name
 * @returns {Promise<void>}
 */
export async function bulkDeleteReports(reportIds, table = 'crime_reports') {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', reportIds);

    if (error) throw error;
  } catch (error) {
    throw new Error(error.message || 'Failed to bulk delete reports');
  }
}
