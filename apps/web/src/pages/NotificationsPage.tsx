import { PageIntro } from "@/components/templates/PageIntro"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Activity"
        title="Notifications"
        description="Real-time and email notifications will appear here after the notification service is wired."
      />
      <Card>
        <CardHeader>
          <CardTitle>Inbox shell</CardTitle>
          <CardDescription>Mentions, replies, and workspace events will route here.</CardDescription>
        </CardHeader>
        <CardContent className="type-body-sm text-body">No notifications yet.</CardContent>
      </Card>
    </div>
  )
}
