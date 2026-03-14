/**
 * Services Index
 * Central export point for all API services
 */

// Authentication API - All auth-related functions
export {
  // User Authentication
  signUpUser,
  signInUser,
  signInWithOAuth,
  signOutUser,

  // Password Management
  sendPasswordResetEmail,
  updatePassword,

  // Email Management
  updateEmail,
  isEmailVerified,

  // User Profile
  createUserProfile,
  getCurrentUserProfile,
  updateUserProfile,

  // Session Management
  getSessionData,
  refreshSession,

  // Magic Link / OTP
  sendMagicLink,
  verifyEmailOTP,
} from "./authApi";

// Reporting API - All reporting-related functions
export {
  // Crime Reports
  submitCrimeReport,
  getAllCrimeReports,
  getMyCrimeReports,
  updateCrimeReportStatus,
  deleteCrimeReport,

  // Missing Persons
  submitMissingPersonReport,
  getAllMissingPersons,
  updateMissingPersonStatus,

  // Missing Property
  submitMissingPropertyReport,
  getAllMissingProperty,

  // General Reports
  submitGeneralReport,
  getAllGeneralReports,
  updateGeneralReportStatus,

  // Notifications
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // Statistics
  getReportingStatistics,
  getReportsByCategory,
  getRecentActivity,

  // Bulk Operations
  bulkUpdateReportStatus,
  bulkDeleteReports,
} from "./reportingApi";

// Admin API - All admin management functions
export {
  // Admin Management
  getAllAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  checkAdminStatus,

  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getUserStatistics,

  // Permissions
  getAdminPermissions,
  updateAdminPermissions,
  hasPermission,

  // Broadcast Messages
  sendBroadcastMessage,

  // Activity Logs
  getAdminActivityLogs,

  // System Settings
  getSystemSettings,
  updateSystemSettings,

  // Bulk Operations
  bulkDeleteUsers,
  bulkUpdateUserStatus,

  // Constants
  PERMISSIONS,
  ADMIN_ROLES,
} from "./adminApi";

// Legacy Services (for backwards compatibility)
export { submitCrimeReport as legacySubmitCrimeReport } from "./crimeReports";
export * from "./mediaUpload";
