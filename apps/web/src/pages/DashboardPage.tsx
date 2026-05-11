import { Bell, CircleHelp, CircleCheck } from "lucide-react"

import { MetricCard } from "@/components/templates/MetricCard"
import { PageIntro } from "@/components/templates/PageIntro"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useUserSync } from "@/hooks/useUserSync"

export default function DashboardPage() {
  const { user, isSyncing } = useUserSync()

  return (
    <div className="space-y-10">
      <PageIntro
        eyebrow="Workspace overview"
        title="Dashboard"
        description="Workspace analytics, assigned queries, and activity feeds will live here."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active queries" value="0" hint="Coming soon" icon={CircleHelp} />
        <MetricCard label="Resolved rate" value="0%" hint="Coming soon" icon={CircleCheck} />
        <MetricCard label="Notifications" value="0" hint="Coming soon" icon={Bell} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Synced account</CardTitle>
          <CardDescription>
            Clerk sessions are mirrored into the Wikiora API for workspace permissions and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 type-body-sm text-body">
          {isSyncing ? <p>Syncing user profile...</p> : null}
          {user ? (
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
                  <p className="type-caption-mono-sm text-muted-foreground">Role</p>
                  <p className="type-body-md text-foreground">{user.globalRole}</p>
                </div>
              </div>
              <Separator />
              <p>Account sync is active. Workspace and query modules can build on this profile next.</p>
            </>
          ) : (
            <p>User profile will appear after Clerk sync completes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
