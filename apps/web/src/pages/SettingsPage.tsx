import { PageIntro } from "@/components/templates/PageIntro"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Preferences"
        title="Settings"
        description="Profile preferences, notification settings, and workspace configuration will be managed here."
      />
      <Card>
        <CardHeader>
          <CardTitle>Settings shell</CardTitle>
          <CardDescription>Forms and workspace controls will be added in a later phase.</CardDescription>
        </CardHeader>
        <CardContent className="type-body-sm text-body">
          Settings modules are not implemented in this scaffold.
        </CardContent>
      </Card>
    </div>
  )
}
