import { UserRound } from "lucide-react"

import { QueryOpBadge, QueryRoleBadge } from "@/features/queries/QueryRoleBadge"
import { cn } from "@/lib/utils"
import type { WorkspaceRole } from "@/types/query"

type QueryAuthorHeaderProps = {
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  role: WorkspaceRole
  createdAt: string
  isOriginalPoster?: boolean
  className?: string
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function QueryAuthorHeader({
  firstName,
  lastName,
  email,
  avatarUrl,
  role,
  createdAt,
  isOriginalPoster = false,
  className,
}: QueryAuthorHeaderProps) {
  const displayName = `${firstName} ${lastName}`.trim() || email

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full border border-border object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
          <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
        </div>
      )}
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="type-body-md text-foreground">{displayName}</p>
          <QueryRoleBadge role={role} />
          {isOriginalPoster ? <QueryOpBadge /> : null}
        </div>
        <p className="type-caption-mono-sm text-muted-foreground">{formatTimestamp(createdAt)}</p>
      </div>
    </div>
  )
}
