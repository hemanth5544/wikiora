import { useAuth, useUser } from "@clerk/clerk-react"
import { useEffect } from "react"

import { useGetCurrentUserQuery, useSyncCurrentUserMutation } from "@/features/auth/authApi"

export function useUserSync() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const { data, error, isFetching, refetch } = useGetCurrentUserQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const [syncUser, syncState] = useSyncCurrentUserMutation()

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || isFetching || data) {
      return
    }

    const status = error && "status" in error ? error.status : undefined
    const shouldSync = status === 404 || status === 401
    if (!shouldSync) {
      return
    }

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) {
      return
    }

    void syncUser({
      email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      avatarUrl: user.imageUrl ?? undefined,
    })
  }, [data, error, isFetching, isLoaded, isSignedIn, syncUser, user])

  return {
    user: data,
    isSyncing: syncState.isLoading,
    refetch,
  }
}
