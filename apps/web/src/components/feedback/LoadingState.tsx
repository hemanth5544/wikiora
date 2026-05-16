import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/** Inline actions only (buttons, small submits). Prefer skeletons for page/section data. */
type LoadingStateProps = {
  label?: string
  size?: "sm" | "md" | "lg"
  layout?: "inline" | "section"
  className?: string
  children?: ReactNode
}

export function LoadingState({
  label = "Loading",
  size = "md",
  layout = "inline",
  className,
  children,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        layout === "section" && "justify-center py-16",
        className,
      )}
    >
      <Spinner size={size} label={label} />
      {label ? <p className="type-body-sm text-body">{label}</p> : null}
      {children}
    </div>
  )
}

export function PageIntroSkeleton() {
  return (
    <div className="mb-8 space-y-4" aria-hidden>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="h-5 w-full max-w-2xl" />
    </div>
  )
}

export function PageContentSkeleton({ withMetrics = false }: { withMetrics?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading page">
      <PageIntroSkeleton />
      {withMetrics ? (
        <div className="mb-8 grid gap-4 md:grid-cols-3" aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-sm" />
          ))}
        </div>
      ) : null}
      <Skeleton className="h-48 w-full rounded-sm" />
    </div>
  )
}

export function AppShellSkeleton() {
  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background" aria-busy="true" aria-label="Loading app">
      <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-card/50 p-4 lg:block" aria-hidden>
        <Skeleton className="mb-8 h-8 w-28 rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </aside>
      <div className="min-w-0 flex-1 overflow-y-auto py-6 md:py-8">
        <div className="container-app">
          <PageContentSkeleton withMetrics />
        </div>
      </div>
    </div>
  )
}

export function QueryDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading query">
      <Skeleton className="mb-6 h-9 w-20" />
      <div className="space-y-6 border-b border-border pb-6">
        <Skeleton className="h-8 w-full max-w-xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Skeleton className="h-5 w-24" />
        <ReplySkeleton />
        <ReplySkeleton />
      </div>
    </div>
  )
}

function ReplySkeleton() {
  return (
    <div className="flex gap-3 rounded-sm border border-border p-4" aria-hidden>
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

export function WorkspaceDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading workspace">
      <Skeleton className="mb-4 h-9 w-36" />
      <PageIntroSkeleton />
      <div className="mb-6 flex gap-2" aria-hidden>
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <FeedListSkeleton />
    </div>
  )
}

export function ListRowsSkeleton({ count = 4, compact = false }: { count?: number; compact?: boolean }) {
  if (compact) {
    return (
      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border" aria-hidden>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="flex items-center gap-4 bg-background px-4 py-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-[132px] shrink-0" />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      ))}
    </div>
  )
}

export function InviteListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <section className="surface-card px-4 py-5 md:px-6" aria-hidden>
      <Skeleton className="mb-4 h-5 w-40" />
      <ListRowsSkeleton count={count} />
    </section>
  )
}

/** @deprecated Use PageContentSkeleton */
export function PageLoader() {
  return <PageContentSkeleton />
}

export function SessionLoader() {
  return <AppShellSkeleton />
}

export function FeedListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-0" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border-b border-border py-6 last:border-b-0">
          <Skeleton className="mb-2 h-5 w-2/3 max-w-md" />
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="mt-3 h-8 w-48" />
        </div>
      ))}
    </div>
  )
}

export function WorkspaceGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="py-4">
          <Skeleton className="mb-2 h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </li>
      ))}
    </ul>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-start gap-4" aria-hidden>
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}
