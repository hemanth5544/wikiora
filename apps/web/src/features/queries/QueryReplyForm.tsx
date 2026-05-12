import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCreateWorkspaceQueryReplyMutation } from "@/features/queries/queryApi"
import { cn } from "@/lib/utils"

type QueryReplyFormProps = {
  workspaceId: string
  queryId: string
  parentReplyId?: string
  onCancel?: () => void
  onSuccess?: () => void
  submitLabel?: string
}

export function QueryReplyForm({
  workspaceId,
  queryId,
  parentReplyId,
  onCancel,
  onSuccess,
  submitLabel = "Reply",
}: QueryReplyFormProps) {
  const [body, setBody] = useState("")
  const [createReply, { isLoading }] = useCreateWorkspaceQueryReplyMutation()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!body.trim()) {
      return
    }

    try {
      await createReply({
        workspaceId,
        queryId,
        body: { body: body.trim(), parentReplyId },
      }).unwrap()
      setBody("")
      onSuccess?.()
    } catch {
      toast.error("Could not post reply")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write a reply..."
        required
        rows={4}
        className={cn(
          "flex min-h-[96px] w-full rounded-sm border border-input bg-secondary px-4 py-3 type-body-md text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isLoading || body.trim().length === 0}>
          {isLoading ? "Posting..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
