import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  className?: string
}

export function MetricCard({ label, value, hint, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="type-body-sm text-body">{label}</CardTitle>
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
        </div>
        {hint ? <CardDescription>{hint}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p className="type-display-sm text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}
