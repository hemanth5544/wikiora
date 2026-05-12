export type WorkspaceRole = "admin" | "member" | "user"

export type Workspace = {
  id: string
  name: string
  slug: string
  description?: string
  visibility: "private" | "public"
  logoUrl?: string
  ownerId: string
  role?: WorkspaceRole
}

export type WorkspaceMember = {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  email: string
  firstName: string
  lastName: string
}

export type CreateWorkspaceBody = {
  name: string
  description?: string
  visibility?: "private" | "public"
  logoUrl?: string
}

export type UpdateWorkspaceBody = {
  name?: string
  description?: string
  visibility?: "private" | "public"
  logoUrl?: string
}

export type WorkspaceInviteRole = "member" | "user"

export type WorkspaceInvite = {
  id: string
  workspaceId: string
  email: string
  role: WorkspaceInviteRole
  token?: string
  status: "pending" | "accepted" | "revoked"
  expiresAt: string
  invitedById: string
  createdAt: string
}

export type PendingInvite = {
  id: string
  workspaceId: string
  workspaceName: string
  workspaceSlug: string
  email: string
  role: WorkspaceInviteRole
  token: string
  status: "pending" | "accepted" | "revoked"
  expiresAt: string
  invitedById: string
  invitedByEmail: string
  invitedByName: string
  createdAt: string
}

export type CreateWorkspaceInviteBody = {
  email: string
  role: WorkspaceInviteRole
}
