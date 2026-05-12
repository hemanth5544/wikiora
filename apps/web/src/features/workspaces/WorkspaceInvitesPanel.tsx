import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { LoadingState } from "@/components/feedback/LoadingState"
import { MotionCard } from "@/components/motion/MotionPrimitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectMenu } from "@/components/ui/select-menu"
import {
  useCreateWorkspaceInviteMutation,
  useGetWorkspaceInvitesQuery,
  useResendWorkspaceInviteMutation,
  useRevokeWorkspaceInviteMutation,
} from "@/features/workspaces/inviteApi"
import { useGetWorkspacesQuery } from "@/features/workspaces/workspaceApi"
import type { WorkspaceInviteRole } from "@/types/workspace"

function inviteLink(token: string) {
  return `${window.location.origin}/app/invites/accept?token=${encodeURIComponent(token)}`
}

type WorkspaceInvitesPanelProps = {
  workspaceId?: string
  embedded?: boolean
}

export function WorkspaceInvitesPanel({ workspaceId, embedded = false }: WorkspaceInvitesPanelProps) {
  const { data: workspaces = [] } = useGetWorkspacesQuery()
  const adminWorkspaces = workspaces.filter((workspace) => workspace.role === "admin")
  const [internalWorkspaceId, setInternalWorkspaceId] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<WorkspaceInviteRole>("member")
  const activeWorkspaceId = (workspaceId ?? internalWorkspaceId) || adminWorkspaces[0]?.id || ""
  const { data: invites = [], isFetching } = useGetWorkspaceInvitesQuery(activeWorkspaceId, {
    skip: !activeWorkspaceId,
  })
  const [createInvite, { isLoading: isCreating }] = useCreateWorkspaceInviteMutation()
  const [revokeInvite, { isLoading: isRevoking }] = useRevokeWorkspaceInviteMutation()
  const [resendInvite, { isLoading: isResending }] = useResendWorkspaceInviteMutation()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeWorkspaceId || !email.trim()) {
      return
    }

    try {
      const invite = await createInvite({
        workspaceId: activeWorkspaceId,
        body: { email: email.trim(), role },
      }).unwrap()
      setEmail("")
      if (invite.token) {
        await navigator.clipboard.writeText(inviteLink(invite.token))
        toast.success("Invite created and link copied")
      } else {
        toast.success("Invite created")
      }
    } catch {
      toast.error("Could not create invite")
    }
  }

  async function handleRevoke(inviteId: string) {
    if (!activeWorkspaceId) {
      return
    }

    try {
      await revokeInvite({ workspaceId: activeWorkspaceId, inviteId }).unwrap()
      toast.success("Invite revoked")
    } catch {
      toast.error("Could not revoke invite")
    }
  }

  async function handleResend(inviteId: string) {
    if (!activeWorkspaceId) {
      return
    }

    try {
      const invite = await resendInvite({ workspaceId: activeWorkspaceId, inviteId }).unwrap()
      if (invite.token) {
        await navigator.clipboard.writeText(inviteLink(invite.token))
        toast.success("Invite refreshed and link copied")
      } else {
        toast.success("Invite refreshed")
      }
    } catch {
      toast.error("Could not resend invite")
    }
  }

  if (!embedded && adminWorkspaces.length === 0) {
    return (
      <section className="surface-card px-4 py-5 md:px-6">
        <p className="type-body-sm text-body">Only workspace admins can invite people by email.</p>
      </section>
    )
  }

  const content = (
    <div className="space-y-6">
      {!embedded ? (
        <SelectMenu
          value={activeWorkspaceId}
          onChange={setInternalWorkspaceId}
          options={adminWorkspaces.map((workspace) => ({
            value: workspace.id,
            label: workspace.name,
          }))}
        />
      ) : null}
      <form className="grid gap-4 md:grid-cols-[1fr_160px_auto]" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <SelectMenu
            id="invite-role"
            value={role}
            onChange={(value) => setRole(value as WorkspaceInviteRole)}
            options={[
              { value: "member", label: "Member" },
              { value: "user", label: "User" },
            ]}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isCreating}>
            Send invite
          </Button>
        </div>
      </form>

      {isFetching ? <LoadingState label="Loading invites" layout="inline" size="sm" /> : null}
      {!isFetching && invites.length === 0 ? (
        <p className="type-body-sm text-body">No invites yet for this workspace.</p>
      ) : null}
      <div className="space-y-3">
        {invites.map((invite) => (
          <MotionCard
            key={invite.id}
            className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="type-body-md text-foreground">{invite.email}</p>
              <p className="type-body-sm text-body">
                {invite.role} · {invite.status} · expires {new Date(invite.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="muted">{invite.status}</Badge>
              {invite.status === "pending" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isResending}
                    onClick={() => handleResend(invite.id)}
                  >
                    Resend
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isRevoking}
                    onClick={() => handleRevoke(invite.id)}
                  >
                    Revoke
                  </Button>
                </>
              ) : null}
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <section className="surface-card px-4 py-5 md:px-6">
      <div className="mb-4 space-y-1">
        <h2 className="type-body-md text-foreground">Invites</h2>
        <p className="type-body-sm text-body">Invite teammates as member or user. They must sign in with the invited email.</p>
      </div>
      {content}
    </section>
  )
}
