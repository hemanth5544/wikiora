import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import { getAuthToken } from "@/services/authToken"

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1"

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: async (headers) => {
      const token = await getAuthToken()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["User", "Workspace", "WorkspaceMember", "WorkspaceInvite", "Query"],
  endpoints: () => ({}),
})
