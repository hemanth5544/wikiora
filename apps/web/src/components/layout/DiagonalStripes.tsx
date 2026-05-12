import { cn } from "@/lib/utils"

type DiagonalStripesProps = {
  className?: string
  embedded?: boolean
}

export function DiagonalStripes({ className, embedded = false }: DiagonalStripesProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "diagonal-stripes pointer-events-none absolute  hidden w-5 lg:block",
        embedded ? "inset-y-0 right-0 " : "-bottom-16 -left-5 -top-28",
        className,
      )}
    />
  )
}
