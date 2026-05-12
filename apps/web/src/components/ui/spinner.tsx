import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "h-4 w-4 border",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-2",
} as const

type SpinnerProps = {
  size?: keyof typeof sizeClasses
  className?: string
  label?: string
}

export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-muted border-t-accent-dusk",
        sizeClasses[size],
        className,
      )}
    />
  )
}
