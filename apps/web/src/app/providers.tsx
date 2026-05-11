import { ClerkProvider } from "@clerk/clerk-react"
import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"

import { AuthSessionBridge } from "@/components/AuthSessionBridge"
import { ThemeInit } from "@/components/ThemeInit"
import { store } from "@/store"

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  if (!clerkPublishableKey) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="max-w-lg text-sm text-muted-foreground">
          Missing `VITE_CLERK_PUBLISHABLE_KEY`. Copy `.env.example` to `apps/web/.env` and add your
          Clerk publishable key.
        </p>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeInit />
          <AuthSessionBridge />
          {children}
          <Toaster richColors closeButton />
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  )
}
