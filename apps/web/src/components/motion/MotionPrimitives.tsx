import { motion, type HTMLMotionProps } from "framer-motion"
import type { ReactNode } from "react"

import { fadeUp, motionEase, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

type MotionPageProps = {
  children: ReactNode
  className?: string
}

export function MotionPage({ children, className }: MotionPageProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={cn("space-y-8", className)}
    >
      {children}
    </motion.div>
  )
}

type MotionSectionProps = HTMLMotionProps<"section">

export function MotionSection({ className, children, ...props }: MotionSectionProps) {
  return (
    <motion.section variants={fadeUp} transition={{ duration: 0.35, ease: motionEase }} className={className} {...props}>
      {children}
    </motion.section>
  )
}

type MotionCardProps = HTMLMotionProps<"div">

export function MotionCard({ className, children, ...props }: MotionCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.35, ease: motionEase }}
      whileHover={{ y: -2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type MotionFormFieldProps = {
  children: ReactNode
  className?: string
}

export function MotionFormField({ children, className }: MotionFormFieldProps) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.3, ease: motionEase }}
      className={cn("space-y-2", className)}
    >
      {children}
    </motion.div>
  )
}
