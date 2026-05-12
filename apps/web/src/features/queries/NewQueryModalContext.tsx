import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

type NewQueryModalContextValue = {
  isOpen: boolean
  defaultWorkspaceId?: string
  openNewQuery: (workspaceId?: string) => void
  closeNewQuery: () => void
}

const NewQueryModalContext = createContext<NewQueryModalContextValue | null>(null)

export function NewQueryModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState<string | undefined>()

  const openNewQuery = useCallback((workspaceId?: string) => {
    setDefaultWorkspaceId(workspaceId)
    setIsOpen(true)
  }, [])

  const closeNewQuery = useCallback(() => {
    setIsOpen(false)
    setDefaultWorkspaceId(undefined)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      defaultWorkspaceId,
      openNewQuery,
      closeNewQuery,
    }),
    [closeNewQuery, defaultWorkspaceId, isOpen, openNewQuery],
  )

  return <NewQueryModalContext.Provider value={value}>{children}</NewQueryModalContext.Provider>
}

export function useNewQueryModal() {
  const context = useContext(NewQueryModalContext)
  if (!context) {
    throw new Error("useNewQueryModal must be used within NewQueryModalProvider")
  }
  return context
}
