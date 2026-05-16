import { MessagesSquare } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

type BrandMarkProps = {
  className?: string
  to?: string
  variant?: "default" | "landing"
}

export function BrandMark({ className, to = "/", variant = "default" }: BrandMarkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 type-body-sm text-foreground",
        variant === "default" && "rounded-full border border-[color:var(--outline-border)] px-3 py-1.5",
        className,
      )}
    >
      <MessagesSquare className="h-4 w-4" aria-hidden />
      <span>Wikiora</span>
    </Link>
  )
}
