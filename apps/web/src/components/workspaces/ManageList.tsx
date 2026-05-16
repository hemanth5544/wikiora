import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function ManageList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul className={cn("divide-y divide-border overflow-hidden rounded-md border border-border", className)}>
      {children}
    </ul>
  )
}

type ManageListItemProps = {
  children: ReactNode
  className?: string
}

export function ManageListItem({ children, className }: ManageListItemProps) {
  return <li className={cn("flex items-center gap-4 bg-background px-4 py-3", className)}>{children}</li>
}

export function ManageListAvatar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted type-body-sm font-medium text-foreground",
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  )
}

export function ManageListMeta({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate type-body-sm font-medium text-foreground">{title}</p>
      {subtitle ? <p className="truncate type-body-sm text-body">{subtitle}</p> : null}
    </div>
  )
}

export function ManageListActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex shrink-0 items-center gap-2", className)}>{children}</div>
}

function initialsFromName(firstName: string, lastName: string, email: string) {
  const fromName = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim()
  if (fromName) {
    return fromName.toUpperCase()
  }
  return (email[0] ?? "?").toUpperCase()
}

export { initialsFromName }
