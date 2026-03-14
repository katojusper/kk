import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { AdminRoute } from './components/AdminRoute.jsx'
import { SplashPage } from './pages/SplashPage.jsx'
import { AuthenticationPage } from './pages/AuthenticationPage.jsx'
import { SignUpPage } from './pages/SignUpPage.jsx'
import { AuthCallbackPage } from './pages/AuthCallbackPage.jsx'
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx'
import { MainDashboardPage } from './pages/MainDashboardPage.jsx'
import { ReportCrimePage } from './pages/ReportCrimePage.jsx'
import { GetHelpPage } from './pages/GetHelpPage.jsx'
import { LostAndFoundPage } from './pages/LostAndFoundPage.jsx'
import { MissingPersonsPage } from './pages/MissingPersonsPage.jsx'
import { ReportMissingPersonPage } from './pages/ReportMissingPersonPage.jsx'
import { ReportMissingPropertyPage } from './pages/ReportMissingPropertyPage.jsx'
import { SearchStationsPage } from './pages/SearchStationsPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { NotificationsPage } from './pages/NotificationsPage.jsx'
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx'
import { ManageAdminsPage } from './pages/ManageAdminsPage.jsx'
import { ManageUsersPage } from './pages/ManageUsersPage.jsx'
import { PendingRequestsPage } from './pages/PendingRequestsPage.jsx'
import { LawsAndRightsPage } from './pages/LawsAndRightsPage.jsx'
import { UploadListPage } from './pages/UploadListPage.jsx'

// Splash + auth screens (no sidebar/topbar), then main app inside layout
export default function App() {
  return (
    <Routes>
      {/* Full-screen splash first, then auth flow */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/auth" element={<AuthenticationPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Main application shell with sidebar/topbar and all feature tabs/cards */}
      <Route element={<AppLayout />}>
        <Route path="/main" element={<MainDashboardPage />} />
        <Route path="/report-crime" element={<ReportCrimePage />} />
        <Route path="/get-help" element={<GetHelpPage />} />
        <Route path="/lost-and-found" element={<LostAndFoundPage />} />
        <Route path="/missing-persons" element={<MissingPersonsPage />} />
        <Route path="/report-missing-person" element={<ReportMissingPersonPage />} />
        <Route path="/report-missing-property" element={<ReportMissingPropertyPage />} />
        <Route path="/laws-and-rights" element={<LawsAndRightsPage />} />
        <Route path="/search-stations" element={<SearchStationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/manage-admins" element={<AdminRoute><ManageAdminsPage /></AdminRoute>} />
        <Route path="/admin/manage-users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
        <Route path="/admin/pending-requests" element={<AdminRoute><PendingRequestsPage /></AdminRoute>} />
        <Route path="/admin/uploads" element={<AdminRoute><UploadListPage /></AdminRoute>} />
      </Route>

      {/* Fallback: if unknown route, go to splash then flow continues to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}



