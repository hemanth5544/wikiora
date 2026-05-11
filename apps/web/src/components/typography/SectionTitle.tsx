import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionTitleProps = {
  children: ReactNode
  className?: string
  as?: "h1" | "h2" | "h3"
  size?: "xl" | "lg" | "md" | "sm"
}

const sizeClass = {
  xl: "type-display-xl",
  lg: "type-display-lg",
  md: "type-display-md",
  sm: "type-display-sm",
} as const

export function SectionTitle({ children, className, as: Tag = "h2", size = "md" }: SectionTitleProps) {
  return <Tag className={cn(sizeClass[size], "text-foreground", className)}>{children}</Tag>
}
