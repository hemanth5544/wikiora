import { Calendar, Globe2, MessageCircle, Users } from "lucide-react"
import type { ReactElement } from "react"

const features = [
  {
    icon: MessageCircle,
    title: "Queries and replies",
    copy: "Post questions in a workspace, thread replies, and mark threads resolved when the answer lands.",
    visual: "chat",
  },
  {
    icon: Users,
    title: "Workspace roles",
    copy: "Admins, members, and guests see what they should—permissions follow the workspace, not the channel.",
    visual: "roles",
  },
  {
    icon: Globe2,
    title: "Cross-workspace feed",
    copy: "Scan open queries across teams from one feed without switching context every time.",
    visual: "feed",
  },
  {
    icon: Calendar,
    title: "Meetings and guest admit",
    copy: "Schedule meetings, verify guests, and let hosts admit or deny from a simple waiting-room flow.",
    visual: "timeline",
  },
]

function ChatVisual() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary/15 px-3 py-2 type-body-sm">
        How do we onboard contractors?
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-background px-3 py-2 type-body-sm text-body">
        HR shared the checklist in #people-ops — I&apos;ll pin it.
      </div>
    </div>
  )
}

function RolesVisual() {
  const nodes = ["Admin", "Member", "Guest"]
  return (
    <div className="relative flex min-h-[140px] items-center justify-center p-6">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-background">
        <Users className="h-8 w-8 text-[var(--landing-accent)]" aria-hidden />
      </div>
      {nodes.map((label, i) => (
        <span
          key={label}
          className="absolute rounded-full border border-border bg-card px-2 py-1 type-body-sm"
          style={{
            top: `${20 + i * 28}%`,
            left: i === 0 ? "8%" : i === 1 ? "72%" : "40%",
          }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

function FeedVisual() {
  return (
    <div className="space-y-2 p-4">
      {[72, 48, 88, 56].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[var(--landing-accent)]/60" style={{ width: `${w}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineVisual() {
  return (
    <div className="flex items-end justify-center gap-2 p-6">
      {[40, 64, 48, 80, 56].map((h, i) => (
        <div
          key={i}
          className="w-6 rounded-t-md bg-[var(--landing-accent)]/50"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}

const visuals: Record<string, () => ReactElement> = {
  chat: ChatVisual,
  roles: RolesVisual,
  feed: FeedVisual,
  timeline: TimelineVisual,
}

export function LandingFeatureBento() {
  return (
    <section id="features" className="border-t border-border px-4 py-20 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 type-body-sm font-medium uppercase tracking-wider text-[var(--landing-accent)]">
            Features
          </p>
          <h2 className="type-display-md text-foreground">Everything teams need to ask, answer, and close.</h2>
          <p className="mt-4 type-body-lg text-body">
            Built around real Wikiora flows—workspaces, queries, invites, and moderation—not generic chat widgets.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Visual = visuals[feature.visual]
            return (
              <article key={feature.title} className="landing-bento-card">
                <Visual />
                <div className="border-t border-border p-6">
                  <feature.icon className="mb-3 h-5 w-5 text-[var(--landing-accent)]" aria-hidden />
                  <h3 className="type-display-xs text-foreground">{feature.title}</h3>
                  <p className="mt-2 type-body-sm text-body">{feature.copy}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
