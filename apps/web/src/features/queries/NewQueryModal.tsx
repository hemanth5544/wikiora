import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight, CircleHelp, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { CreateQueryForm } from "@/features/queries/CreateQueryForm"
import { useNewQueryModal } from "@/features/queries/NewQueryModalContext"
import { useGetWorkspacesQuery } from "@/features/workspaces/workspaceApi"
import { motionEase } from "@/lib/motion"
import { Button } from "@/components/ui/button"

export function NewQueryModal() {
  const { isOpen, defaultWorkspaceId, closeNewQuery } = useNewQueryModal()
  const { data: workspaces = [] } = useGetWorkspacesQuery()
  const [workspaceId, setWorkspaceId] = useState("")

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const fallbackWorkspaceId = defaultWorkspaceId ?? workspaces[0]?.id ?? ""
    setWorkspaceId(fallbackWorkspaceId)
  }, [defaultWorkspaceId, isOpen, workspaces])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeNewQuery()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [closeNewQuery, isOpen])

  const workspaceOptions = workspaces.map((workspace) => ({
    value: workspace.id,
    label: workspace.name,
  }))

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: motionEase }}
        >
          <button
            type="button"
            aria-label="Close new query dialog"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeNewQuery}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-query-title"
            className="relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-md)] border border-border bg-card shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: motionEase }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={closeNewQuery}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={closeNewQuery} aria-label="Close">
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            <div className="overflow-y-auto px-5 py-5 md:px-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary">
                    <CircleHelp className="h-4 w-4 text-foreground" aria-hidden />
                  </div>
                  <div>
                    <h2 id="new-query-title" className="type-display-xs text-foreground">
                      New query
                    </h2>
                    <p className="mt-1 type-body-sm text-body">Start a thread in one of your workspaces.</p>
                  </div>
                </div>
                <Link
                  to="/app/queries"
                  onClick={closeNewQuery}
                  className="inline-flex items-center gap-1 type-body-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Learn more
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              {workspaces.length === 0 ? (
                <div className="space-y-4 rounded-md border border-border bg-secondary/50 px-4 py-6">
                  <p className="type-body-sm text-body">Create a workspace before posting your first query.</p>
                  <Button asChild>
                    <Link to="/app/workspaces/manage" onClick={closeNewQuery}>
                      Manage workspaces
                    </Link>
                  </Button>
                </div>
              ) : workspaceId ? (
                <CreateQueryForm
                  key={workspaceId}
                  workspaceId={workspaceId}
                  workspaceOptions={workspaceOptions}
                  onWorkspaceChange={setWorkspaceId}
                  onSuccess={closeNewQuery}
                  onClose={closeNewQuery}
                />
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
