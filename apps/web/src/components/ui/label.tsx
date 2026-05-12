import type * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("type-caption-mono-sm text-muted-foreground", className)} {...props} />
}

export { Label }
