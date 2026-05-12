import { baseApi } from "@/services/baseApi"
import type {
  CreateWorkspaceBody,
  UpdateWorkspaceBody,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/workspace"

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => "/workspaces",
      providesTags: (result) =>
        result
          ? [
              ...result.map((workspace) => ({ type: "Workspace" as const, id: workspace.id })),
              { type: "Workspace", id: "LIST" },
            ]
          : [{ type: "Workspace", id: "LIST" }],
    }),
    createWorkspace: builder.mutation<Workspace, CreateWorkspaceBody>({
      query: (body) => ({
        url: "/workspaces",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Workspace", id: "LIST" }],
    }),
    getWorkspace: builder.query<Workspace, string>({
      query: (id) => `/workspaces/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Workspace", id }],
    }),
    updateWorkspace: builder.mutation<Workspace, { id: string; body: UpdateWorkspaceBody }>({
      query: ({ id, body }) => ({
        url: `/workspaces/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Workspace", id },
        { type: "Workspace", id: "LIST" },
      ],
    }),
    getWorkspaceMembers: builder.query<WorkspaceMember[], string>({
      query: (id) => `/workspaces/${id}/members`,
      providesTags: (_result, _error, id) => [{ type: "WorkspaceMember", id }],
    }),
    updateWorkspaceMemberRole: builder.mutation<
      void,
      { workspaceId: string; userId: string; role: WorkspaceRole }
    >({
      query: ({ workspaceId, userId, role }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [{ type: "WorkspaceMember", id: workspaceId }],
    }),
  }),
})

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useUpdateWorkspaceMemberRoleMutation,
} = workspaceApi
