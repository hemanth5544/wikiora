import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

const marqueeItems = [
  "Workspace queries",
  "Role-based access",
  "Invites",
  "Open threads",
  "Cross-workspace feed",
  "Scheduled meetings",
]

function MarqueeRow() {
  const doubled = [...marqueeItems, ...marqueeItems]
  return (
    <div className="landing-marquee mt-12" aria-hidden>
      <div className="landing-marquee-track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex shrink-0 items-center gap-6 type-body-sm text-body">
            <span>{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--landing-accent)]" />
          </span>
        ))}
      </div>
    </div>
  )
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 md:px-6 md:pb-24">
      <div className="landing-glow" aria-hidden />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-6 inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 type-body-sm text-body backdrop-blur-sm">
          Workspace Q&amp;A platform
        </p>
        <h1 className="type-display-xl text-foreground">
          Questions, answers, and resolution—in every workspace.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl type-body-lg text-body">
          Wikiora helps teams post queries, discuss in threads, and close the loop with roles,
          invites, and moderation—without losing context across workspaces.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <SignedOut>
            <SignUpButton mode="modal">
              <button type="button" className="landing-btn-primary px-8 py-3 text-base">
                Get started free
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" size="lg" className="rounded-full">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" className="landing-btn-primary rounded-full">
              <Link to="/app">Open dashboard</Link>
            </Button>
          </SignedIn>
        </div>
        <MarqueeRow />
      </div>
    </section>
  )
}
