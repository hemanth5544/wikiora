import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session...
      </div>
    )
  }

  if (!isSignedIn) {
    const redirectUrl = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/sign-in?redirect_url=${redirectUrl}`} replace />
  }

  return <Outlet />
}
