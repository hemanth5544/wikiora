import { FeedListSkeleton } from "@/components/feedback/LoadingState"
import { QueryFeedCard } from "@/features/queries/QueryFeedCard"
import { useGetWorkspaceQueriesQuery } from "@/features/queries/queryApi"

type WorkspaceQueryListProps = {
  workspaceId: string
}

export function WorkspaceQueryList({ workspaceId }: WorkspaceQueryListProps) {
  const { data: queries = [], isFetching } = useGetWorkspaceQueriesQuery(workspaceId)

  return (
    <section className="surface-card px-4 py-2 md:px-6">
      <div className="border-b border-border py-4">
        <h2 className="type-body-md text-foreground">Workspace queries</h2>
        <p className="type-body-sm text-body">Open a thread to read replies and join the discussion.</p>
      </div>
      {isFetching && queries.length === 0 ? <FeedListSkeleton /> : null}
      {!isFetching && queries.length === 0 ? (
        <p className="type-body-sm text-body py-6">No queries yet. Use New query in the sidebar to post the first one.</p>
      ) : null}
      {queries.map((query) => (
        <QueryFeedCard key={query.id} query={query} />
      ))}
    </section>
  )
}
