import { useState } from "react"
import { toast } from "sonner"

import { LoadingState } from "@/components/feedback/LoadingState"
import { MotionCard } from "@/components/motion/MotionPrimitives"
import { Badge } from "@/components/ui/badge"
import { SelectMenu } from "@/components/ui/select-menu"
import {
  useGetWorkspaceMembersQuery,
  useGetWorkspacesQuery,
  useUpdateWorkspaceMemberRoleMutation,
} from "@/features/workspaces/workspaceApi"
import type { WorkspaceRole } from "@/types/workspace"

type WorkspaceMembersPanelProps = {
  workspaceId?: string
  embedded?: boolean
}

export function WorkspaceMembersPanel({ workspaceId, embedded = false }: WorkspaceMembersPanelProps) {
  const { data: workspaces = [] } = useGetWorkspacesQuery()
  const [internalWorkspaceId, setInternalWorkspaceId] = useState("")
  const activeWorkspaceId = (workspaceId ?? internalWorkspaceId) || workspaces[0]?.id || ""
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId)
  const { data: members = [], isFetching } = useGetWorkspaceMembersQuery(activeWorkspaceId, {
    skip: !activeWorkspaceId,
  })
  const [updateRole, { isLoading }] = useUpdateWorkspaceMemberRoleMutation()

  async function handleRoleChange(userId: string, role: WorkspaceRole) {
    if (!activeWorkspaceId) {
      return
    }

    try {
      await updateRole({ workspaceId: activeWorkspaceId, userId, role }).unwrap()
      toast.success("Member role updated")
    } catch {
      toast.error("Could not update member role")
    }
  }

  if (!embedded && workspaces.length === 0) {
    return (
      <section className="surface-card px-4 py-5 md:px-6">
        <p className="type-body-sm text-body">Create a workspace first to manage member roles.</p>
      </section>
    )
  }

  const content = (
    <div className="space-y-3">
      {!embedded ? (
        <SelectMenu
          value={activeWorkspaceId}
          onChange={setInternalWorkspaceId}
          options={workspaces.map((workspace) => ({
            value: workspace.id,
            label: workspace.name,
          }))}
        />
      ) : null}
      {isFetching ? <LoadingState label="Loading members" layout="inline" size="sm" /> : null}
      {!isFetching && members.length === 0 ? (
        <p className="type-body-sm text-body">No members found for this workspace.</p>
      ) : null}
      {members.map((member) => (
        <MotionCard
          key={member.id}
          className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="type-body-md text-foreground">
              {member.firstName} {member.lastName}
            </p>
            <p className="type-body-sm text-body">{member.email}</p>
          </div>
          {activeWorkspace?.role === "admin" ? (
            <SelectMenu
              value={member.role}
              disabled={isLoading}
              onChange={(value) => handleRoleChange(member.userId, value as WorkspaceRole)}
              options={[
                { value: "admin", label: "Admin" },
                { value: "member", label: "Member" },
                { value: "user", label: "User" },
              ]}
              className="md:max-w-[180px]"
            />
          ) : (
            <Badge variant="muted">{member.role}</Badge>
          )}
        </MotionCard>
      ))}
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <section className="surface-card px-4 py-5 md:px-6">
      <div className="mb-4 space-y-1">
        <h2 className="type-body-md text-foreground">Members and roles</h2>
        <p className="type-body-sm text-body">Admins can assign admin, member, or user roles inside a workspace.</p>
      </div>
      {content}
    </section>
  )
}
