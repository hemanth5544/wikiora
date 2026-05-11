import { useAuth } from "@clerk/clerk-react"
import { useEffect } from "react"

import { setAuthTokenGetter } from "@/services/authToken"

export function AuthSessionBridge() {
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    setAuthTokenGetter(() => getToken())
  }, [getToken, isLoaded])

  return null
}
