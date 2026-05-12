import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useEffect } from "react"

import { CreateWorkspaceForm } from "@/features/workspaces/CreateWorkspaceForm"
import { motionEase } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type CreateWorkspaceModalProps = {
  open: boolean
  onClose: () => void
}

export function CreateWorkspaceModal({ open, onClose }: CreateWorkspaceModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: motionEase }}
        >
          <button
            type="button"
            aria-label="Close create workspace dialog"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-workspace-title"
            className="relative z-10 w-full max-w-lg"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: motionEase }}
          >
            <Card className="border-border shadow-2xl">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1.5">
                  <CardTitle id="create-workspace-title">Create workspace</CardTitle>
                  <CardDescription>The creator becomes the workspace admin automatically.</CardDescription>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                  <X className="h-4 w-4" aria-hidden />
                </Button>
              </CardHeader>
              <CardContent>
                <CreateWorkspaceForm onCancel={onClose} onSuccess={onClose} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
