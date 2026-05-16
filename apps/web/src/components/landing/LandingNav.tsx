import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

import { BrandMark } from "@/components/brand/BrandMark"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "#features", label: "Features" },
  { href: "#preview", label: "Product" },
  { href: "#security", label: "Security" },
]

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 px-4 pb-4 pt-4 md:px-6">
      <nav className="landing-nav-pill" aria-label="Main">
        <BrandMark variant="landing" className="shrink-0" />
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="type-body-sm text-body transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="landing-btn-primary">
                Get started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button asChild size="sm" className={cn("landing-btn-primary", "h-9 px-4")}>
              <Link to="/app">Open app</Link>
            </Button>
          </SignedIn>
        </div>
      </nav>
    </header>
  )
}
