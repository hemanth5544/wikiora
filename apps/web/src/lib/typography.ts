import { cn } from "@/lib/utils"

export const display = {
  xl: "type-display-xl",
  lg: "type-display-lg",
  md: "type-display-md",
  sm: "type-display-sm",
  xs: "type-display-xs",
} as const

export const body = {
  lg: "type-body-lg",
  md: "type-body-md",
  sm: "type-body-sm",
} as const

export const mono = {
  caption: "type-caption-mono",
  captionSm: "type-caption-mono-sm",
} as const

export function textClass(...classes: Array<string | false | null | undefined>) {
  return cn(classes)
}
