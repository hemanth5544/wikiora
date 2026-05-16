import { MessageSquareText, Search } from "lucide-react"

const mockQueries = [
  { title: "VPN access for remote interns", status: "Open", replies: 4 },
  { title: "Q3 budget approval workflow", status: "In progress", replies: 12 },
  { title: "Guest Wi-Fi policy update", status: "Resolved", replies: 7 },
]

export function LandingProductPreview() {
  return (
    <section id="preview" className="px-4 pb-20 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 type-body-sm text-muted-foreground">wikiora.app</span>
          </div>
          <div className="flex min-h-[320px] md:min-h-[380px]">
            <aside className="hidden w-52 shrink-0 border-r border-border bg-muted/20 p-3 md:block">
              <p className="mb-3 px-2 type-body-sm font-medium text-foreground">Engineering</p>
              <nav className="space-y-0.5">
                {["Dashboard", "Queries", "Workspaces", "Notifications"].map((item, i) => (
                  <div
                    key={item}
                    className={`rounded-lg px-2 py-1.5 type-body-sm ${
                      i === 1 ? "bg-primary/10 font-medium text-primary" : "text-body"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </nav>
            </aside>
            <div className="flex-1 p-4 md:p-6">
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span className="type-body-sm text-muted-foreground">Search queries…</span>
              </div>
              <div className="space-y-3">
                {mockQueries.map((q) => (
                  <article
                    key={q.title}
                    className="rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--landing-accent)]" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate type-body font-medium text-foreground">{q.title}</h3>
                        <p className="mt-1 type-body-sm text-body">
                          {q.status} · {q.replies} replies
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
