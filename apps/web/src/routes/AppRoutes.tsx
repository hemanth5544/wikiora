import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/layouts/AppLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const SignInPage = lazy(() => import("@/pages/SignInPage"))
const SignUpPage = lazy(() => import("@/pages/SignUpPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const QueriesPage = lazy(() => import("@/pages/QueriesPage"))
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Loading page...
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
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
