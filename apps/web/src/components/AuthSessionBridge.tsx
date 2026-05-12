import { useAuth } from "@clerk/clerk-react"
import { useEffect } from "react"

import { clearAuthTokenGetter, setAuthTokenGetter } from "@/services/authToken"

export function AuthSessionBridge() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded) {
      clearAuthTokenGetter()
      return
    }

    if (!isSignedIn) {
      clearAuthTokenGetter()
      return
    }

    setAuthTokenGetter(async () => getToken())
  }, [getToken, isLoaded, isSignedIn])

  return null
}
