import { Link } from "react-router-dom"
import { toast } from "sonner"

import { LoadingState } from "@/components/feedback/LoadingState"
import { MotionCard } from "@/components/motion/MotionPrimitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAcceptInviteMutation, useGetMyInvitesQuery } from "@/features/workspaces/inviteApi"

function inviteLink(token: string) {
  return `/app/invites/accept?token=${encodeURIComponent(token)}`
}

export function PendingInvitesPanel() {
  const { data: invites = [], isFetching } = useGetMyInvitesQuery()
  const [acceptInvite, { isLoading }] = useAcceptInviteMutation()

  async function handleAccept(token: string) {
    try {
      const workspace = await acceptInvite({ token }).unwrap()
      toast.success(`Joined ${workspace.name}`)
    } catch {
      toast.error("Could not accept invite")
    }
  }

  if (isFetching) {
    return (
      <section className="surface-card px-4 py-4 md:px-6">
        <LoadingState label="Loading invites" size="md" />
      </section>
    )
  }

  if (invites.length === 0) {
    return null
  }

  return (
    <section className="surface-card px-4 py-4 md:px-6">
      <div className="mb-3 space-y-1">
        <h2 className="type-body-md text-foreground">Pending invites</h2>
        <p className="type-body-sm text-body">Accept workspace invites sent to your signed-in email.</p>
      </div>
      <div className="space-y-3">
        {invites.map((invite) => (
          <MotionCard
            key={invite.id}
            className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="type-body-md text-foreground">{invite.workspaceName}</p>
              <p className="type-body-sm text-body">
                {invite.role} · invited by {invite.invitedByName || invite.invitedByEmail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="muted">{invite.status}</Badge>
              <Button type="button" size="sm" disabled={isLoading} onClick={() => handleAccept(invite.token)}>
                Accept
              </Button>
              <Button asChild type="button" variant="outline" size="sm">
                <Link to={inviteLink(invite.token)}>Open link</Link>
              </Button>
            </div>
          </MotionCard>
        ))}
      </div>
    </section>
  )
}
