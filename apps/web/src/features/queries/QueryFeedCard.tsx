import { Link } from "react-router-dom"

import { QueryAuthorHeader } from "@/features/queries/QueryAuthorHeader"
import { Badge } from "@/components/ui/badge"
import type { Query } from "@/types/query"

type QueryFeedCardProps = {
  query: Query
  showWorkspace?: boolean
}

export function QueryFeedCard({ query, showWorkspace = false }: QueryFeedCardProps) {
  return (
    <article className="border-b border-border py-6 last:border-b-0">
      <Link to={`/app/workspaces/${query.workspaceId}/queries/${query.id}`} className="group block space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {showWorkspace && query.workspaceName ? (
              <Badge variant="accent">{query.workspaceName}</Badge>
            ) : null}
            <Badge variant="muted">{query.status}</Badge>
            <Badge variant="default">{query.replyCount} replies</Badge>
          </div>
          <h2 className="type-display-xs text-foreground transition-colors group-hover:text-primary">{query.title}</h2>
          <p className="type-body-md line-clamp-3 whitespace-pre-wrap text-body">{query.body}</p>
        </div>
        <QueryAuthorHeader
          firstName={query.authorFirstName}
          lastName={query.authorLastName}
          email={query.authorEmail}
          avatarUrl={query.authorAvatarUrl}
          role={query.authorRole}
          createdAt={query.createdAt}
          isOriginalPoster
        />
      </Link>
    </article>
  )
}
