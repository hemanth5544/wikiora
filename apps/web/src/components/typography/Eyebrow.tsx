import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EyebrowProps = {
  children: ReactNode
  className?: string
  small?: boolean
}

export function Eyebrow({ children, className, small = false }: EyebrowProps) {
  return (
    <p className={cn(small ? "type-caption-mono-sm" : "type-caption-mono", "text-foreground", className)}>
      {children}
    </p>
  )
}
