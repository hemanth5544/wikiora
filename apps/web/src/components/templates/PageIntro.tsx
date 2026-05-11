import type { ReactNode } from "react"

import { Eyebrow } from "@/components/typography/Eyebrow"
import { SectionTitle } from "@/components/typography/SectionTitle"
import { cn } from "@/lib/utils"

type PageIntroProps = {
  eyebrow?: string
  title: string
  description?: ReactNode
  className?: string
  titleSize?: "xl" | "lg" | "md" | "sm"
}

export function PageIntro({ eyebrow, title, description, className, titleSize = "md" }: PageIntroProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <SectionTitle as="h1" size={titleSize}>
        {title}
      </SectionTitle>
      {description ? <p className="max-w-2xl type-body-lg text-body">{description}</p> : null}
    </div>
  )
}
