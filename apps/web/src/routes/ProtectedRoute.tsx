import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { SessionLoader } from "@/components/feedback/LoadingState"

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return <SessionLoader />
  }

  if (!isSignedIn) {
    const redirectUrl = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/sign-in?redirect_url=${redirectUrl}`} replace />
  }

  return <Outlet />
}
