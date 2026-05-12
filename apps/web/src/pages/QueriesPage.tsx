import { Link } from "react-router-dom"

import { FeedListSkeleton } from "@/components/feedback/LoadingState"
import { MotionPage } from "@/components/motion/MotionPrimitives"
import { PageIntro } from "@/components/templates/PageIntro"
import { QueryFeedCard } from "@/features/queries/QueryFeedCard"
import { useGetMyQueriesQuery } from "@/features/queries/queryApi"

export default function QueriesPage() {
  const { data: queries = [], isFetching } = useGetMyQueriesQuery()

  return (
    <MotionPage>
      <PageIntro
        eyebrow="Query feed"
        title="Queries"
        description="All questions from every workspace you belong to, in one feed."
      />

      <section className="surface-card px-4 py-2 md:px-6">
        {isFetching && queries.length === 0 ? <FeedListSkeleton /> : null}
        {!isFetching && queries.length === 0 ? (
          <p className="type-body-sm text-body py-6">No queries yet. Use New query in the sidebar to post one.</p>
        ) : null}
        {queries.map((query) => (
          <QueryFeedCard key={`${query.workspaceId}-${query.id}`} query={query} showWorkspace />
        ))}
      </section>

      {!isFetching && queries.length > 0 ? (
        <p className="type-body-sm text-body">
          Open a thread to reply, or browse queries inside a specific{" "}
          <Link to="/app/workspaces" className="text-foreground underline underline-offset-4">
            workspace
          </Link>
          .
        </p>
      ) : null}
    </MotionPage>
  )
}
