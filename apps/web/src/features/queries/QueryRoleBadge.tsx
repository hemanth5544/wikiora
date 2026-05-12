import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { WorkspaceRole } from "@/types/query"

const roleStyles: Record<WorkspaceRole, string> = {
  admin: "border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  member: "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  user: "border-sky-300/40 bg-sky-500/10 text-sky-700 dark:text-sky-200",
}

type QueryRoleBadgeProps = {
  role: WorkspaceRole
  className?: string
}

export function QueryRoleBadge({ role, className }: QueryRoleBadgeProps) {
  return (
    <Badge className={cn("rounded-sm px-2 py-0.5 type-caption-mono-sm uppercase", roleStyles[role], className)}>
      {role}
    </Badge>
  )
}

export function QueryOpBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn("rounded-sm border-fuchsia-300/40 bg-fuchsia-500/10 px-2 py-0.5 type-caption-mono-sm uppercase text-fuchsia-700 dark:text-fuchsia-200", className)}>
      OP
    </Badge>
  )
}
