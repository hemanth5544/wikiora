import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { PageLoader } from "@/components/feedback/LoadingState"
import { AppLayout } from "@/layouts/AppLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const SignInPage = lazy(() => import("@/pages/SignInPage"))
const SignUpPage = lazy(() => import("@/pages/SignUpPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const WorkspacesPage = lazy(() => import("@/pages/WorkspacesPage"))
const QueriesPage = lazy(() => import("@/pages/QueriesPage"))
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))
const AcceptInvitePage = lazy(() => import("@/pages/AcceptInvitePage"))
const QueryDetailPage = lazy(() => import("@/pages/QueryDetailPage"))
const WorkspaceDetailPage = lazy(() => import("@/pages/WorkspaceDetailPage"))
const WorkspaceManagePage = lazy(() => import("@/pages/WorkspaceManagePage"))

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="workspaces/manage" element={<WorkspaceManagePage />} />
            <Route path="workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
            <Route path="workspaces/:workspaceId/queries/:queryId" element={<QueryDetailPage />} />
            <Route path="invites/accept" element={<AcceptInvitePage />} />
            <Route path="queries" element={<QueriesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
