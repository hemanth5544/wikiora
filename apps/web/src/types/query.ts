export type QueryStatus = "open" | "resolved"

export type WorkspaceRole = "admin" | "member" | "user"

export type Query = {
  id: string
  workspaceId: string
  authorId: string
  title: string
  body: string
  status: QueryStatus
  authorEmail: string
  authorFirstName: string
  authorLastName: string
  authorAvatarUrl?: string
  authorRole: WorkspaceRole
  workspaceName?: string
  replyCount: number
  createdAt: string
  updatedAt: string
}

export type QueryReply = {
  id: string
  queryId: string
  workspaceId: string
  authorId: string
  parentReplyId?: string
  body: string
  authorEmail: string
  authorFirstName: string
  authorLastName: string
  authorAvatarUrl?: string
  authorRole: WorkspaceRole
  createdAt: string
  updatedAt: string
}

export type QueryDetail = {
  query: Query
  replies: QueryReply[]
}

export type CreateQueryBody = {
  title: string
  body: string
}

export type CreateQueryReplyBody = {
  body: string
  parentReplyId?: string
}

export type UpdateQueryStatusBody = {
  status: QueryStatus
}
