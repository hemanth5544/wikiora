import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { LoadingState } from "@/components/feedback/LoadingState"
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SelectMenu } from "@/components/ui/select-menu"
import { QueryAuthorHeader } from "@/features/queries/QueryAuthorHeader"
import { QueryReplyForm } from "@/features/queries/QueryReplyForm"
import { QueryReplyThread } from "@/features/queries/QueryReplyThread"
import {
  useGetWorkspaceQueryDetailQuery,
  useUpdateWorkspaceQueryStatusMutation,
} from "@/features/queries/queryApi"
import { useGetWorkspaceQuery } from "@/features/workspaces/workspaceApi"
import type { QueryStatus } from "@/types/query"

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
]

export default function QueryDetailPage() {
  const { workspaceId = "", queryId = "" } = useParams()
  const { data: workspace } = useGetWorkspaceQuery(workspaceId, { skip: !workspaceId })
  const { data, isFetching, isError } = useGetWorkspaceQueryDetailQuery(
    { workspaceId, queryId },
    { skip: !workspaceId || !queryId },
  )
  const [updateStatus, { isLoading }] = useUpdateWorkspaceQueryStatusMutation()

  const canManage = workspace?.role === "admin" || workspace?.role === "member"

  async function handleStatusChange(status: QueryStatus) {
    if (!workspaceId || !queryId) {
      return
    }

    try {
      await updateStatus({ workspaceId, queryId, body: { status } }).unwrap()
    } catch {
      // ignore
    }
  }

  if (!workspaceId || !queryId) {
    return null
  }

  if (isFetching) {
    return (
      <MotionPage>
        <LoadingState label="Loading query" size="lg" layout="section" />
      </MotionPage>
    )
  }

  if (isError || !data) {
    return (
      <MotionPage>
        <p className="type-body-sm text-body">This query could not be loaded.</p>
        <Button asChild variant="outline">
          <Link to={`/app/workspaces/${workspaceId}`}>Back to workspace</Link>
        </Button>
      </MotionPage>
    )
  }

  const { query, replies } = data

  return (
    <MotionPage>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button asChild variant="ghost" className="px-0">
          <Link to={`/app/workspaces/${workspaceId}`} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Link>
        </Button>
        {canManage ? (
          <SelectMenu
            value={query.status}
            onChange={(value) => handleStatusChange(value as QueryStatus)}
            options={statusOptions}
            disabled={isLoading}
            className="w-[180px]"
          />
        ) : null}
      </div>

      <MotionSection className="space-y-6">
        <div className="space-y-4 border-b border-border pb-6">
          <h1 className="type-display-sm text-foreground">{query.title}</h1>
          <QueryAuthorHeader
            firstName={query.authorFirstName}
            lastName={query.authorLastName}
            email={query.authorEmail}
            avatarUrl={query.authorAvatarUrl}
            role={query.authorRole}
            createdAt={query.createdAt}
            isOriginalPoster
          />
          <p className="type-body-md whitespace-pre-wrap text-body">{query.body}</p>
          <div className="flex flex-wrap items-center gap-2">
            {query.status === "resolved" ? (
              <Badge className="rounded-sm border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
                Solved
              </Badge>
            ) : (
              <Badge variant="muted">Open</Badge>
            )}
            <Badge variant="default">{query.replyCount} replies</Badge>
            {workspace?.name ? <Badge variant="accent">{workspace.name}</Badge> : null}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="type-body-md text-foreground">{replies.length} Replies</h2>
          <QueryReplyThread
            workspaceId={workspaceId}
            queryId={queryId}
            originalAuthorId={query.authorId}
            replies={replies}
          />
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="type-body-md text-foreground">Add a reply</h3>
          <QueryReplyForm workspaceId={workspaceId} queryId={queryId} />
        </div>
      </MotionSection>
    </MotionPage>
  )
}
