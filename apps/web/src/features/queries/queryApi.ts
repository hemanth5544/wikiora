import { baseApi } from "@/services/baseApi"
import type {
  CreateQueryBody,
  CreateQueryReplyBody,
  Query,
  QueryDetail,
  QueryReply,
  QueryStatus,
  UpdateQueryStatusBody,
} from "@/types/query"

export const queryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyQueries: builder.query<Query[], void>({
      query: () => "/queries",
      providesTags: [{ type: "Query", id: "FEED" }],
    }),
    getWorkspaceQueries: builder.query<Query[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/queries`,
      providesTags: (_result, _error, workspaceId) => [{ type: "Query", id: workspaceId }],
    }),
    getWorkspaceQueryDetail: builder.query<QueryDetail, { workspaceId: string; queryId: string }>({
      query: ({ workspaceId, queryId }) => `/workspaces/${workspaceId}/queries/${queryId}`,
      providesTags: (_result, _error, { workspaceId, queryId }) => [
        { type: "Query", id: workspaceId },
        { type: "Query", id: `${workspaceId}-${queryId}` },
      ],
    }),
    createWorkspaceQuery: builder.mutation<Query, { workspaceId: string; body: CreateQueryBody }>({
      query: ({ workspaceId, body }) => ({
        url: `/workspaces/${workspaceId}/queries`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Query", id: workspaceId },
        { type: "Query", id: "FEED" },
      ],
    }),
    createWorkspaceQueryReply: builder.mutation<
      QueryReply,
      { workspaceId: string; queryId: string; body: CreateQueryReplyBody }
    >({
      query: ({ workspaceId, queryId, body }) => ({
        url: `/workspaces/${workspaceId}/queries/${queryId}/replies`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId, queryId }) => [
        { type: "Query", id: workspaceId },
        { type: "Query", id: `${workspaceId}-${queryId}` },
        { type: "Query", id: "FEED" },
      ],
    }),
    updateWorkspaceQueryStatus: builder.mutation<
      Query,
      { workspaceId: string; queryId: string; body: UpdateQueryStatusBody }
    >({
      query: ({ workspaceId, queryId, body }) => ({
        url: `/workspaces/${workspaceId}/queries/${queryId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId, queryId }) => [
        { type: "Query", id: workspaceId },
        { type: "Query", id: `${workspaceId}-${queryId}` },
        { type: "Query", id: "FEED" },
      ],
    }),
  }),
})

export const {
  useGetMyQueriesQuery,
  useGetWorkspaceQueriesQuery,
  useGetWorkspaceQueryDetailQuery,
  useCreateWorkspaceQueryMutation,
  useCreateWorkspaceQueryReplyMutation,
  useUpdateWorkspaceQueryStatusMutation,
} = queryApi

export function isQueryStatus(value: string): value is QueryStatus {
  return value === "open" || value === "resolved"
}
