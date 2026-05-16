import { Eye, Shield, UserPlus } from "lucide-react"

const cards = [
  {
    icon: Shield,
    title: "Role-based control",
    copy: "Workspace admins manage members, invites, and who can post or moderate queries.",
  },
  {
    icon: UserPlus,
    title: "Invite-only access",
    copy: "Bring people in deliberately—no public sprawl. Guests join with the right scope from day one.",
  },
  {
    icon: Eye,
    title: "Visibility you choose",
    copy: "Queries can be workspace-wide or scoped so sensitive threads stay where they belong.",
  },
]

export function LandingTrustSection() {
  return (
    <section id="security" className="relative overflow-hidden border-t border-border px-4 py-20 md:px-6">
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 opacity-[0.07]"
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="h-full w-full text-foreground">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 type-body-sm font-medium uppercase tracking-wider text-[var(--landing-accent)]">
            Security
          </p>
          <h2 className="type-display-md text-foreground">Built for teams that need control.</h2>
          <p className="mt-4 type-body-lg text-body">
            Authentication via Clerk, workspace boundaries, and admin tooling—so growth does not mean losing the
            guardrails.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="landing-bento-card p-6">
              <card.icon className="mb-4 h-6 w-6 text-[var(--landing-accent)]" aria-hidden />
              <h3 className="type-display-xs text-foreground">{card.title}</h3>
              <p className="mt-2 type-body-sm text-body">{card.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="type-display-sm text-foreground">Clerk auth + API-first</h3>
              <p className="mt-2 max-w-xl type-body text-body">
                Sign-in syncs users into Wikiora. Your workspace data stays behind the API—ready for webhooks and
                integrations as you grow.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {["Clerk", "REST API", "Workspaces", "Webhooks"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-card px-3 py-1.5 type-body-sm text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
