import { useUser } from "@clerk/clerk-react"
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronDown,
  CircleHelp,
  FolderCog,
  Inbox,
  LayoutDashboard,
  Layers3,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  UserRound,
} from "lucide-react"
import { useState } from "react"
import { NavLink } from "react-router-dom"

import { DiagonalStripes } from "@/components/layout/DiagonalStripes"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNewQueryModal } from "@/features/queries/NewQueryModalContext"
import { cn } from "@/lib/utils"

type SidebarLink = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  badge?: string
}

type SidebarSection = {
  id: string
  title: string
  items: SidebarLink[]
}

const sections: SidebarSection[] = [
  {
    id: "workspace",
    title: "Workspace",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/app/workspaces", label: "Workspaces", icon: Layers3, end: true },
      { to: "/app/workspaces/manage", label: "Manage workspaces", icon: FolderCog },
      { to: "/app/queries", label: "Queries", icon: MessageSquareText },
      { to: "/app/notifications", label: "Notifications", icon: Bell, badge: "New" },
    ],
  },
  {
    id: "my-activity",
    title: "My activity",
    items: [
      { to: "/app/notifications", label: "Inbox", icon: Inbox },
      { to: "/app/queries", label: "My queries", icon: UserRound },
      { to: "/app/queries", label: "Assigned", icon: CircleHelp },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    items: [
      { to: "/app/settings", label: "Account settings", icon: Settings },
      { to: "/app", label: "Getting started", icon: ArrowUpRight },
      { to: "/app", label: "Guides", icon: BookOpen },
    ],
  },
]

function SidebarNavItem({ item }: { item: SidebarLink }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-sm px-2 py-2 type-body-sm transition-colors",
          isActive
            ? "bg-muted text-foreground"
            : "text-body hover:bg-muted/70 hover:text-foreground",
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <Badge variant="accent" className="ml-auto">
          {item.badge}
        </Badge>
      ) : null}
    </NavLink>
  )
}

function SidebarSectionBlock({ section }: { section: SidebarSection }) {
  const [open, setOpen] = useState(true)

  return (
    <section className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left type-caption-mono-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open ? "rotate-0" : "-rotate-90")} />
        {section.title}
      </button>
      {open ? (
        <div className="space-y-0.5">
          {section.items.map((item) => (
            <SidebarNavItem key={`${section.id}-${item.label}`} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function AppSidebar() {
  const { user } = useUser()
  const { openNewQuery } = useNewQueryModal()
  const displayName = user?.username ?? user?.firstName ?? "Member"
  const roleLabel = user?.publicMetadata?.role
  const role =
    typeof roleLabel === "string" && roleLabel.length > 0 ? roleLabel.toUpperCase() : "MEMBER"

  return (
    <aside className="relative hidden h-full w-[280px] shrink-0 flex-col border-r border-border bg-secondary lg:flex">
      <div className="flex h-full min-h-0 flex-col overflow-y-auto px-4 py-5">
        <div className="mb-5 flex items-center gap-3 px-1">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full border border-border object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
              <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate type-body-sm text-foreground">{displayName}</p>
            <Badge variant="muted" className="mt-1">
              {role}
            </Badge>
          </div>
        </div>

        <div className="mb-5 space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-56 justify-between rounded-sm"
            onClick={() => openNewQuery()}
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              New query
            </span>
            <span className="rounded-sm border border-border px-1.5 py-0.5 type-caption-mono-sm text-muted-foreground">
              N
            </span>
          </Button>

          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search" className="h-9 w-full rounded-sm pl-9 pr-12 type-body-sm" />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-border px-1.5 py-0.5 type-caption-mono-sm text-muted-foreground">
              ⌘K
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <SidebarSectionBlock key={section.id} section={section} />
          ))}
        </div>

        <div className="mt-auto space-y-1 border-t border-border pt-4">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-sm px-2 py-2 type-body-sm transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-body hover:bg-muted/70 hover:text-foreground",
              )
            }
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden />
            Account settings
          </NavLink>
          <div className="flex items-center justify-between rounded-sm px-2 py-2">
            <span className="type-body-sm text-body">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <DiagonalStripes embedded />
    </aside>
  )
}
