import { UserButton } from "@clerk/clerk-react"
import { Bell, LayoutDashboard, MessageSquareText, Settings } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { BrandMark } from "@/components/brand/BrandMark"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/app", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/app/queries", label: "Queries", icon: MessageSquareText },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container-app flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6">
            <BrandMark to="/app" />
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 type-body-sm transition-colors",
                      isActive
                        ? "border-[color:var(--outline-border)] bg-muted text-foreground"
                        : "border-transparent text-body hover:border-[color:var(--outline-border)] hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="container-app py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  )
}
