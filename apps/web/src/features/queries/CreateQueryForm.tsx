import { type FormEvent, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Check, ChevronDown, ChevronUp, Info, Paperclip } from "lucide-react"
import { toast } from "sonner"

import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select-menu"
import { useCreateWorkspaceQueryMutation, useGetWorkspaceQueriesQuery } from "@/features/queries/queryApi"
import type { Query } from "@/types/query"
import { cn } from "@/lib/utils"

type CreateQueryFormProps = {
  workspaceId: string
  workspaceOptions: { value: string; label: string }[]
  onWorkspaceChange: (workspaceId: string) => void
  onSuccess?: () => void
  onClose?: () => void
}

type QueryAudience = "workspace" | "private"

function formatRelativeTime(value: string) {
  const elapsedMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.floor(elapsedMs / 60000))

  if (minutes < 60) {
    return `${minutes} min ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} hr ago`
  }

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

function replyLabel(count: number) {
  return `${count} ${count === 1 ? "reply" : "replies"}`
}

function findSimilarQueries(queries: Query[], search: string) {
  const normalized = search.trim().toLowerCase()
  if (normalized.length < 2) {
    return []
  }

  return queries
    .filter(
      (query) =>
        query.title.toLowerCase().includes(normalized) || query.body.toLowerCase().includes(normalized),
    )
    .slice(0, 5)
}

export function CreateQueryForm({
  workspaceId,
  workspaceOptions,
  onWorkspaceChange,
  onSuccess,
  onClose,
}: CreateQueryFormProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [audience, setAudience] = useState<QueryAudience>("workspace")
  const [showSimilar, setShowSimilar] = useState(true)
  const [createQuery, { isLoading }] = useCreateWorkspaceQueryMutation()
  const { data: workspaceQueries = [] } = useGetWorkspaceQueriesQuery(workspaceId, {
    skip: !workspaceId,
  })

  const similarQueries = useMemo(() => findSimilarQueries(workspaceQueries, title), [title, workspaceQueries])
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && audience === "workspace"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    try {
      await createQuery({
        workspaceId,
        body: { title: title.trim(), body: body.trim() },
      }).unwrap()
      toast.success("Thread created")
      setTitle("")
      setBody("")
      setAudience("workspace")
      onSuccess?.()
    } catch {
      toast.error("Could not create thread")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <Input
          id="query-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a short, descriptive title"
          required
          className="h-11 rounded-md border-border bg-card focus-visible:border-accent-dusk focus-visible:ring-accent-dusk/30"
        />

        {similarQueries.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-border bg-secondary/70">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <p className="inline-flex items-center gap-2 type-body-sm text-body">
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                {similarQueries.length} similar threads found
              </p>
              <button
                type="button"
                onClick={() => setShowSimilar((current) => !current)}
                className="inline-flex items-center gap-1 type-body-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {showSimilar ? "Hide" : "Show"}
                {showSimilar ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            {showSimilar ? (
              <div className="divide-y divide-border border-t border-border bg-card">
                {similarQueries.map((query) => (
                  <Link
                    key={query.id}
                    to={`/app/workspaces/${query.workspaceId}/queries/${query.id}`}
                    onClick={onClose}
                    className="flex items-start justify-between gap-4 px-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="type-body-sm text-foreground">{query.title}</span>
                    <span className="shrink-0 text-right type-caption-mono-sm text-muted-foreground">
                      {formatRelativeTime(query.createdAt)}
                      <br />
                      {replyLabel(query.replyCount)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <textarea
          id="query-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={`Please include as much information as you can, including but not limited to:\n\n• Description of the issue you're facing\n• Error messages and descriptions\n• Logs (build and/or deploy)\n• Links to repos, templates, or docs, if applicable`}
          required
          rows={8}
          className={cn(
            "min-h-[220px] w-full resize-y rounded-md border border-border bg-secondary px-4 py-3 pr-12 type-body-md text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dusk/30",
          )}
        />
        <button
          type="button"
          disabled
          title="Attachments coming soon"
          className="absolute bottom-3 right-3 rounded-sm p-1.5 text-muted-foreground"
        >
          <Paperclip className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="space-y-2">
        <p className="type-caption-mono-sm text-muted-foreground">Workspace</p>
        <SelectMenu
          value={workspaceId}
          onChange={onWorkspaceChange}
          options={workspaceOptions}
          placeholder="Required. Select the workspace this thread belongs to."
          className="[&_button]:h-11 [&_button]:rounded-md [&_button]:bg-secondary"
        />
      </div>

      <div className="space-y-2">
        <p className="type-caption-mono-sm text-muted-foreground">Visibility</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setAudience("workspace")}
            className={cn(
              "rounded-md border px-4 py-3 text-left transition-colors",
              audience === "workspace"
                ? "border-accent-dusk bg-accent-dusk/10"
                : "border-border bg-card hover:border-[color:var(--outline-border)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="type-body-sm text-foreground">Ask the workspace</p>
                <p className="type-body-sm text-body">Visible to everyone in this workspace.</p>
              </div>
              {audience === "workspace" ? <Check className="h-4 w-4 shrink-0 text-accent-dusk" aria-hidden /> : null}
            </div>
          </button>
          <button
            type="button"
            disabled
            className="rounded-md border border-border bg-muted/40 px-4 py-3 text-left opacity-70"
          >
            <div className="space-y-1">
              <p className="type-body-sm text-foreground">Ask privately</p>
              <p className="type-body-sm text-body">Direct help with a longer response time. Coming soon.</p>
            </div>
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="h-11 w-full rounded-md border-transparent bg-accent-dusk text-white hover:bg-accent-dusk/90"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" label="Creating thread" className="border-white/30 border-t-white" />
            Creating...
          </>
        ) : (
          "Create thread"
        )}
      </Button>
    </form>
  )
}
