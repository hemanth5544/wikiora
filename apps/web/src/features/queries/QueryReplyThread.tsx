import { useMemo, useState } from "react"

import { QueryAuthorHeader } from "@/features/queries/QueryAuthorHeader"
import { QueryReplyForm } from "@/features/queries/QueryReplyForm"
import { Button } from "@/components/ui/button"
import type { QueryReply } from "@/types/query"

type QueryReplyThreadProps = {
  workspaceId: string
  queryId: string
  originalAuthorId: string
  replies: QueryReply[]
}

type ReplyNode = QueryReply & {
  children: ReplyNode[]
}

function buildReplyTree(replies: QueryReply[]): ReplyNode[] {
  const nodes = new Map<string, ReplyNode>()
  const roots: ReplyNode[] = []

  for (const reply of replies) {
    nodes.set(reply.id, { ...reply, children: [] })
  }

  for (const reply of replies) {
    const node = nodes.get(reply.id)
    if (!node) {
      continue
    }

    if (reply.parentReplyId && nodes.has(reply.parentReplyId)) {
      nodes.get(reply.parentReplyId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function ReplyItem({
  reply,
  workspaceId,
  queryId,
  originalAuthorId,
  depth = 0,
}: {
  reply: ReplyNode
  workspaceId: string
  queryId: string
  originalAuthorId: string
  depth?: number
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className={depth > 0 ? "ml-4 border-l border-border pl-4" : undefined}>
      <article className="space-y-3 rounded-sm border border-border bg-card p-4">
        <QueryAuthorHeader
          firstName={reply.authorFirstName}
          lastName={reply.authorLastName}
          email={reply.authorEmail}
          avatarUrl={reply.authorAvatarUrl}
          role={reply.authorRole}
          createdAt={reply.createdAt}
          isOriginalPoster={reply.authorId === originalAuthorId}
        />
        <p className="type-body-sm whitespace-pre-wrap text-body">{reply.body}</p>
        <Button type="button" size="sm" variant="ghost" onClick={() => setShowReplyForm((value) => !value)}>
          Reply
        </Button>
        {showReplyForm ? (
          <QueryReplyForm
            workspaceId={workspaceId}
            queryId={queryId}
            parentReplyId={reply.id}
            onCancel={() => setShowReplyForm(false)}
            onSuccess={() => setShowReplyForm(false)}
          />
        ) : null}
      </article>
      <div className="mt-3 space-y-3">
        {reply.children.map((child) => (
          <ReplyItem
            key={child.id}
            reply={child}
            workspaceId={workspaceId}
            queryId={queryId}
            originalAuthorId={originalAuthorId}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  )
}

export function QueryReplyThread({ workspaceId, queryId, originalAuthorId, replies }: QueryReplyThreadProps) {
  const replyTree = useMemo(() => buildReplyTree(replies), [replies])

  if (replyTree.length === 0) {
    return <p className="type-body-sm text-body">No replies yet. Start the conversation below.</p>
  }

  return (
    <div className="space-y-4">
      {replyTree.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          workspaceId={workspaceId}
          queryId={queryId}
          originalAuthorId={originalAuthorId}
        />
      ))}
    </div>
  )
}
