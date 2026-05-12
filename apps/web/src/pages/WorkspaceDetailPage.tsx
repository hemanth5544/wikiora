import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { LoadingState } from "@/components/feedback/LoadingState"
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives"
import { PageIntro } from "@/components/templates/PageIntro"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WorkspaceQueryList } from "@/features/queries/WorkspaceQueryList"
import { useGetWorkspaceQuery } from "@/features/workspaces/workspaceApi"

export default function WorkspaceDetailPage() {
  const { workspaceId = "" } = useParams()
  const { data: workspace, isFetching, isError } = useGetWorkspaceQuery(workspaceId, {
    skip: !workspaceId,
  })

  if (!workspaceId) {
    return (
      <MotionPage>
        <PageIntro eyebrow="Workspace" title="Workspace not found" description="Choose a workspace from the list." />
      </MotionPage>
    )
  }

  if (isFetching) {
    return (
      <MotionPage>
        <LoadingState label="Loading workspace" size="lg" layout="section" />
      </MotionPage>
    )
  }

  if (isError || !workspace) {
    return (
      <MotionPage>
        <PageIntro
          eyebrow="Workspace"
          title="Workspace unavailable"
          description="You may not have access to this workspace."
        />
        <Button asChild variant="outline">
          <Link to="/app/workspaces">Back to workspaces</Link>
        </Button>
      </MotionPage>
    )
  }

  return (
    <MotionPage>
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4 px-0">
          <Link to="/app/workspaces" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All workspaces
          </Link>
        </Button>
        <PageIntro
          eyebrow="Workspace"
          title={workspace.name}
          description={workspace.description || "Browse questions and updates for this workspace."}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="muted">{workspace.role}</Badge>
          <Badge variant="default">{workspace.visibility}</Badge>
          <Badge variant="muted">{workspace.slug}</Badge>
        </div>
      </div>

      <MotionSection>
        <WorkspaceQueryList workspaceId={workspace.id} />
      </MotionSection>
    </MotionPage>
  )
}
