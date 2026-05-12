import { useState } from "react"
import { Plus } from "lucide-react"

import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives"
import { PageIntro } from "@/components/templates/PageIntro"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SelectMenu } from "@/components/ui/select-menu"
import { CreateWorkspaceModal } from "@/features/workspaces/CreateWorkspaceModal"
import { PendingInvitesPanel } from "@/features/workspaces/PendingInvitesPanel"
import { WorkspaceInvitesPanel } from "@/features/workspaces/WorkspaceInvitesPanel"
import { WorkspaceMembersPanel } from "@/features/workspaces/WorkspaceMembersPanel"
import { useGetWorkspacesQuery } from "@/features/workspaces/workspaceApi"
import { cn } from "@/lib/utils"

type ManageTab = "members" | "invites"

export default function WorkspaceManagePage() {
  const { data: workspaces = [] } = useGetWorkspacesQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const [workspaceId, setWorkspaceId] = useState("")
  const [activeTab, setActiveTab] = useState<ManageTab>("members")

  const activeWorkspaceId = workspaceId || workspaces[0]?.id || ""
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId)
  const canManageInvites = activeWorkspace?.role === "admin"

  return (
    <MotionPage>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageIntro
          eyebrow="Workspaces"
          title="Manage workspaces"
          description="Invite teammates, assign roles, and keep workspace access organized."
        />
        <Button type="button" className="shrink-0 self-start" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Create workspace
        </Button>
      </div>

      <PendingInvitesPanel />

      <MotionSection className="surface-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6">
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="manage-workspace">Workspace</Label>
            <SelectMenu
              id="manage-workspace"
              value={activeWorkspaceId}
              onChange={setWorkspaceId}
              placeholder="Select a workspace"
              options={workspaces.map((workspace) => ({
                value: workspace.id,
                label: workspace.name,
              }))}
            />
          </div>
          {activeWorkspace ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="muted">{activeWorkspace.role}</Badge>
              <Badge variant="default">{activeWorkspace.visibility}</Badge>
            </div>
          ) : null}
        </div>

        {workspaces.length === 0 ? (
          <div className="px-4 py-10 md:px-6">
            <p className="type-body-sm text-body">Create a workspace to manage members and invites.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-1 border-b border-border px-4 md:px-6">
              <button
                type="button"
                onClick={() => setActiveTab("members")}
                className={cn(
                  "border-b-2 px-3 py-3 type-body-sm transition-colors",
                  activeTab === "members"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-body hover:text-foreground",
                )}
              >
                Members
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("invites")}
                className={cn(
                  "border-b-2 px-3 py-3 type-body-sm transition-colors",
                  activeTab === "invites"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-body hover:text-foreground",
                )}
              >
                Invites
              </button>
            </div>

            <div className="px-4 py-5 md:px-6">
              {activeTab === "members" ? (
                <WorkspaceMembersPanel workspaceId={activeWorkspaceId} embedded />
              ) : canManageInvites ? (
                <WorkspaceInvitesPanel workspaceId={activeWorkspaceId} embedded />
              ) : (
                <p className="type-body-sm text-body">Only workspace admins can send and manage invites.</p>
              )}
            </div>
          </>
        )}
      </MotionSection>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </MotionPage>
  )
}
