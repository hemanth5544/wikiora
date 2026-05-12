import type { ReactNode } from "react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type LoadingStateProps = {
  label?: string
  size?: "sm" | "md" | "lg"
  layout?: "inline" | "centered" | "page" | "section"
  className?: string
  children?: ReactNode
}

export function LoadingState({
  label = "Loading",
  size = "md",
  layout = "centered",
  className,
  children,
}: LoadingStateProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        layout === "inline" ? "flex-row" : "flex-col text-center",
        className,
      )}
    >
      <Spinner size={size} label={label} />
      {label ? <p className="type-body-sm text-body">{label}</p> : null}
      {children}
    </div>
  )

  if (layout === "page") {
    return <div className="flex min-h-[40vh] items-center justify-center">{content}</div>
  }

  if (layout === "section") {
    return <div className="surface-card px-4 py-10 md:px-6">{content}</div>
  }

  return content
}

export function PageLoader({ label = "Loading page" }: { label?: string }) {
  return <LoadingState label={label} size="lg" layout="page" />
}

export function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState label="Loading session" size="lg" layout="centered" />
    </div>
  )
}

export function FeedListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-0" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse border-b border-border py-6 last:border-b-0">
          <div className="mb-3 flex gap-2">
            <div className="h-5 w-16 rounded-sm bg-muted" />
            <div className="h-5 w-20 rounded-sm bg-muted" />
          </div>
          <div className="mb-3 h-6 w-2/3 max-w-md rounded-sm bg-muted" />
          <div className="h-16 w-full rounded-sm bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function WorkspaceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="surface-card h-36 animate-pulse bg-secondary/70" />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-4" aria-hidden>
      <div className="h-14 w-14 rounded-full bg-muted" />
      <div className="space-y-2">
        <div className="h-5 w-40 rounded-sm bg-muted" />
        <div className="h-4 w-56 rounded-sm bg-muted" />
        <div className="h-5 w-20 rounded-sm bg-muted" />
      </div>
    </div>
  )
}
