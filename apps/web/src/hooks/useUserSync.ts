import { useAuth, useUser } from "@clerk/clerk-react"
import { useEffect, useRef } from "react"

import { useGetCurrentUserQuery, useSyncCurrentUserMutation } from "@/features/auth/authApi"

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined
  }

  return error.status
}

export function useUserSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const syncAttemptedRef = useRef(false)

  const { data, error, isFetching, refetch } = useGetCurrentUserQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const [syncUser, syncState] = useSyncCurrentUserMutation()

  useEffect(() => {
    syncAttemptedRef.current = false
  }, [user?.id])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncAttemptedRef.current) {
      return
    }

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) {
      return
    }

    syncAttemptedRef.current = true
    void getToken().finally(() => {
      void syncUser({
        email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        avatarUrl: user.imageUrl ?? undefined,
      })
    })
  }, [getToken, isLoaded, isSignedIn, syncUser, user])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || isFetching || data) {
      return
    }

    const status = getErrorStatus(error)
    if (status !== 404) {
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

  useEffect(() => {
    if (syncState.isSuccess) {
      void refetch()
    }
  }, [refetch, syncState.isSuccess])

  return {
    user: data,
    isSyncing: syncState.isLoading,
    syncError: syncState.error,
    refetch,
  }
}
