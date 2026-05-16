import { AnimatePresence, motion } from "framer-motion"
import { UserButton } from "@clerk/clerk-react"
import { Bell, LayoutDashboard, Layers3, MessageSquareText, Settings } from "lucide-react"
import { Suspense } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"

import { BrandMark } from "@/components/brand/BrandMark"
import { PageContentSkeleton } from "@/components/feedback/LoadingState"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { UserSyncBridge } from "@/components/UserSyncBridge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NewQueryModal } from "@/features/queries/NewQueryModal"
import { NewQueryModalProvider } from "@/features/queries/NewQueryModalContext"
import { cn } from "@/lib/utils"

const mobileNavItems = [
  { to: "/app", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/app/workspaces", label: "Workspaces", icon: Layers3 },
  { to: "/app/queries", label: "Queries", icon: MessageSquareText },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <NewQueryModalProvider>
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
        <UserSyncBridge />
        <div className="flex min-h-0 flex-1">
          <AppSidebar />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm lg:hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <BrandMark to="/app" />
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
              <nav className="flex flex-wrap gap-2 px-4 pb-3">
                {mobileNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 type-body-sm",
                        isActive
                          ? "border-[color:var(--outline-border)] bg-muted text-foreground"
                          : "border-transparent text-body",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </header>

            <main className="container-app min-h-0 flex-1 overflow-y-auto py-6 md:py-8">
              <Suspense fallback={<PageContentSkeleton />}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </Suspense>
            </main>
          </div>
        </div>
        <NewQueryModal />
      </div>
    </NewQueryModalProvider>
  )
}
