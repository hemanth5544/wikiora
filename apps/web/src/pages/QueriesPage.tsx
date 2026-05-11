import { PageIntro } from "@/components/templates/PageIntro"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function QueriesPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Query feed"
        title="Queries"
        description="Query creation, filters, threaded replies, and resolution workflows will be added here."
      />
      <Card>
        <CardHeader>
          <CardTitle>Feed shell</CardTitle>
          <CardDescription>Ready for list views, filters, and detail routes.</CardDescription>
        </CardHeader>
        <CardContent className="type-body-sm text-body">
          This page is scaffolded and ready for the query module implementation.
        </CardContent>
      </Card>
    </div>
  )
}
