import { SignedIn, SignedOut, SignUpButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function LandingCtaBand() {
  return (
    <section className="px-4 pb-0 md:px-6">
      <div className="landing-cta-band relative mx-auto max-w-5xl">
        <div className="relative z-10">
          <h2 className="type-display-md text-foreground dark:text-white">Start asking better questions today.</h2>
          <p className="mx-auto mt-4 max-w-lg type-body-lg text-body dark:text-white/85">
            Create a workspace, invite your team, and post your first query in minutes.
          </p>
          <div className="mt-8">
            <SignedOut>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="inline-flex rounded-full bg-[var(--landing-accent)] px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[var(--landing-accent)]"
                >
                  Get started free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[var(--landing-accent)] text-white hover:opacity-90 dark:bg-white dark:text-[var(--landing-accent)] dark:hover:bg-white/90"
              >
                <Link to="/app">Open dashboard</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </div>
    </section>
  )
}
