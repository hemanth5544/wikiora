import { baseApi } from "@/services/baseApi"
import type {
  CreateWorkspaceInviteBody,
  PendingInvite,
  Workspace,
  WorkspaceInvite,
} from "@/types/workspace"

export const inviteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInvites: builder.query<PendingInvite[], void>({
      query: () => "/invites",
      providesTags: [{ type: "WorkspaceInvite", id: "MINE" }],
    }),
    getWorkspaceInvites: builder.query<WorkspaceInvite[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/invites`,
      providesTags: (_result, _error, workspaceId) => [{ type: "WorkspaceInvite", id: workspaceId }],
    }),
    createWorkspaceInvite: builder.mutation<
      WorkspaceInvite,
      { workspaceId: string; body: CreateWorkspaceInviteBody }
    >({
      query: ({ workspaceId, body }) => ({
        url: `/workspaces/${workspaceId}/invites`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "WorkspaceInvite", id: workspaceId },
        { type: "WorkspaceInvite", id: "MINE" },
      ],
    }),
    revokeWorkspaceInvite: builder.mutation<void, { workspaceId: string; inviteId: string }>({
      query: ({ workspaceId, inviteId }) => ({
        url: `/workspaces/${workspaceId}/invites/${inviteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: "WorkspaceInvite", id: workspaceId }],
    }),
    resendWorkspaceInvite: builder.mutation<WorkspaceInvite, { workspaceId: string; inviteId: string }>({
      query: ({ workspaceId, inviteId }) => ({
        url: `/workspaces/${workspaceId}/invites/${inviteId}/resend`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: "WorkspaceInvite", id: workspaceId }],
    }),
    acceptInvite: builder.mutation<Workspace, { token: string }>({
      query: (body) => ({
        url: "/invites/accept",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "WorkspaceInvite", id: "MINE" },
        { type: "Workspace", id: "LIST" },
        { type: "WorkspaceMember", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetMyInvitesQuery,
  useGetWorkspaceInvitesQuery,
  useCreateWorkspaceInviteMutation,
  useRevokeWorkspaceInviteMutation,
  useResendWorkspaceInviteMutation,
  useAcceptInviteMutation,
} = inviteApi
