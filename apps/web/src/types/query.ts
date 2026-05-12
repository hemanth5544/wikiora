export type QueryStatus = "open" | "resolved"

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
  createdAt: string
  updatedAt: string
}

export type CreateQueryBody = {
  title: string
  body: string
}

export type UpdateQueryStatusBody = {
  status: QueryStatus
}
