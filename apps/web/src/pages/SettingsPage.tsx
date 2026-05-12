import { Link } from "react-router-dom"
import { useAuth, useUser } from "@clerk/clerk-react"
import { ArrowUpRight, UserRound } from "lucide-react"

import { ProfileSkeleton } from "@/components/feedback/LoadingState"
import { PageIntro } from "@/components/templates/PageIntro"
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGetCurrentUserQuery } from "@/features/auth/authApi"
import { useGetWorkspacesQuery } from "@/features/workspaces/workspaceApi"

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const { data: user, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })

  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : clerkUser?.fullName || clerkUser?.username || "Member"
  const email = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || "—"
  const avatarUrl = user?.avatarUrl || clerkUser?.imageUrl
  const globalRole = user?.globalRole || "member"

  return (
    <MotionPage>
      <PageIntro
        eyebrow="Account"
        title="Account settings"
        description="Your signed-in profile and workspace access."
      />

      <MotionSection className="surface-card px-5 py-5 md:px-6">
        {isFetching && !user ? (
          <ProfileSkeleton />
        ) : (
          <div className="flex items-start gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-14 w-14 rounded-full border border-border object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                <UserRound className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
            )}
            <div className="space-y-2">
              <div>
                <p className="type-body-md text-foreground">{displayName}</p>
                <p className="type-body-sm text-body">{email}</p>
              </div>
              <Badge variant="muted">{globalRole}</Badge>
            </div>
          </div>
        )}
      </MotionSection>

      <MotionSection className="surface-card px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="type-body-md text-foreground">Workspace access</p>
            <p className="type-body-sm text-body">
              You belong to {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild type="button" variant="outline" size="sm">
              <Link to="/app/workspaces">View workspaces</Link>
            </Button>
            <Button asChild type="button" size="sm">
              <Link to="/app/workspaces/manage">Manage workspaces</Link>
            </Button>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="surface-card px-5 py-5 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="type-body-md text-foreground">Theme</p>
            <p className="type-body-sm text-body">Switch between light and dark appearance.</p>
          </div>
          <ThemeToggle />
        </div>
      </MotionSection>

      <MotionSection className="surface-card px-5 py-5 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="type-body-md text-foreground">Notifications</p>
            <p className="type-body-sm text-body">Email and in-app notification preferences are coming soon.</p>
          </div>
          <Button asChild type="button" variant="ghost" size="sm" className="self-start md:self-auto">
            <Link to="/app/notifications" className="inline-flex items-center gap-1">
              Open notifications
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </MotionSection>
    </MotionPage>
  )
}
