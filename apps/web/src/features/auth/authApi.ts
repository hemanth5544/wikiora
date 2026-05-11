import { baseApi } from "@/services/baseApi"
import type { User } from "@/types/user"

type SyncUserBody = {
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    syncCurrentUser: builder.mutation<User, SyncUserBody>({
      query: (body) => ({
        url: "/users/sync",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
})

export const { useGetCurrentUserQuery, useSyncCurrentUserMutation } = authApi
