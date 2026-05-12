import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import { WorkspaceGridSkeleton } from "@/components/feedback/LoadingState"
import { MotionCard } from "@/components/motion/MotionPrimitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGetWorkspacesQuery } from "@/features/workspaces/workspaceApi"

export function WorkspaceList() {
  const { data: workspaces = [], isFetching } = useGetWorkspacesQuery()

  if (isFetching && workspaces.length === 0) {
    return <WorkspaceGridSkeleton />
  }

  if (workspaces.length === 0) {
    return (
      <div className="surface-card px-5 py-10 text-center">
        <p className="type-body-md text-foreground">No workspaces yet</p>
        <p className="mt-2 type-body-sm text-body">Create one from manage workspaces to start collaborating.</p>
        <Button asChild type="button" variant="outline" size="sm" className="mt-4">
          <Link to="/app/workspaces/manage">Manage workspaces</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {workspaces.map((workspace) => (
        <Link key={workspace.id} to={`/app/workspaces/${workspace.id}`} className="block h-full">
          <MotionCard className="surface-card group flex h-full flex-col gap-4 p-5 transition-colors hover:border-[color:var(--outline-border)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <p className="type-body-md text-foreground">{workspace.name}</p>
                <p className="type-body-sm text-body line-clamp-3">
                  {workspace.description || "No description yet."}
                </p>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                aria-hidden
              />
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              <Badge variant="muted">{workspace.role}</Badge>
              <Badge variant="default">{workspace.visibility}</Badge>
            </div>
          </MotionCard>
        </Link>
      ))}
    </div>
  )
}
