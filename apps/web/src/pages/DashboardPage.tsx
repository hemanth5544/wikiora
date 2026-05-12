import { Bell, CircleCheck, Layers3 } from "lucide-react"
import { useAuth } from "@clerk/clerk-react"

import { ProfileSkeleton } from "@/components/feedback/LoadingState"
import { MetricCard } from "@/components/templates/MetricCard"
import { PageIntro } from "@/components/templates/PageIntro"
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useGetCurrentUserQuery } from "@/features/auth/authApi"
import { useGetWorkspacesQuery } from "@/features/workspaces/workspaceApi"

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { data: user, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })

  return (
    <MotionPage>
      <PageIntro
        eyebrow="Workspace overview"
        title="Dashboard"
        description="Workspace analytics, assigned queries, and activity feeds will live here."
      />

      <MotionSection className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Workspaces" value={String(workspaces.length)} hint="Connected to API" icon={Layers3} />
        <MetricCard label="Resolved rate" value="0%" hint="Coming soon" icon={CircleCheck} />
        <MetricCard label="Notifications" value="0" hint="Coming soon" icon={Bell} />
      </MotionSection>

      <MotionSection>
        <Card>
          <CardHeader>
            <CardTitle>Synced account</CardTitle>
            <CardDescription>
              Clerk sessions are mirrored into the Wikiora API for workspace permissions and analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 type-body-sm text-body">
            {isFetching ? (
              <ProfileSkeleton />
            ) : user ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="type-caption-mono-sm text-muted-foreground">Name</p>
                    <p className="type-body-md text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="type-caption-mono-sm text-muted-foreground">Email</p>
                    <p className="type-body-md text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="type-caption-mono-sm text-muted-foreground">Global role</p>
                    <p className="type-body-md text-foreground">{user.globalRole}</p>
                  </div>
                </div>
                <Separator />
                <p>
                  You currently belong to {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}.
                </p>
              </>
            ) : (
              <p>User profile will appear after Clerk sync completes.</p>
            )}
          </CardContent>
        </Card>
      </MotionSection>
    </MotionPage>
  )
}
