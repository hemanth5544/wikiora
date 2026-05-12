import { PageIntro } from "@/components/templates/PageIntro"
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives"
import { WorkspaceList } from "@/features/workspaces/WorkspaceList"

export default function WorkspacesPage() {
  return (
    <MotionPage>
      <PageIntro
        eyebrow="Workspaces"
        title="Your workspaces"
        description="Open a workspace to view its query feed."
      />

      <MotionSection>
        <WorkspaceList />
      </MotionSection>
    </MotionPage>
  )
}
