import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/clerk-react"
import { ArrowRight, Layers3, ShieldCheck, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

import { BrandMark } from "@/components/brand/BrandMark"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Eyebrow } from "@/components/typography/Eyebrow"
import { SectionTitle } from "@/components/typography/SectionTitle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const pillars = [
  {
    icon: Layers3,
    title: "Workspace-native queries",
    copy: "Organize questions by team, office, or community with shared context and clear ownership.",
  },
  {
    icon: ShieldCheck,
    title: "Moderation built in",
    copy: "Admins and members can resolve threads, pin answers, and keep discussions on track.",
  },
  {
    icon: Sparkles,
    title: "Ready for real-time",
    copy: "The shell is prepared for live updates, notifications, and analytics in later phases.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container-app flex items-center justify-between py-4">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button asChild size="sm">
              <Link to="/app">Open dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </header>

      <main>
        <section className="section-band border-b border-border">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-6">
              <Eyebrow>Query posting and resolution</Eyebrow>
              <SectionTitle as="h1" size="xl">
                A workspace for questions, answers, and team resolution.
              </SectionTitle>
              <p className="max-w-2xl type-body-lg text-body">
                Wikiora brings community support, issue discussions, and internal helpdesk workflows
                into one restrained interface built for organizations, colleges, and project teams.
              </p>
              <div className="flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg">Create account</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg">
                    <Link to="/app">Go to dashboard</Link>
                  </Button>
                </SignedIn>
                <Button asChild variant="outline" size="lg">
                  <Link to="/sign-in">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <Eyebrow small>Platform shell</Eyebrow>
                <CardTitle>Built for collaboration</CardTitle>
                <CardDescription>
                  Clerk authentication, Redux data flow, and a Go API foundation are already wired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 type-body-sm text-body">
                <p>Users sync from Clerk into Wikiora for workspace permissions and analytics.</p>
                <Separator />
                <p>Feature modules for queries, replies, and notifications can now plug into this UI system.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section-band">
          <div className="mb-8 space-y-3">
            <Eyebrow>Product pillars</Eyebrow>
            <SectionTitle size="sm">Designed for teams that need clarity, not clutter.</SectionTitle>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
              <Card key={pillar.title}>
                <CardHeader className="space-y-4">
                  <pillar.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription>{pillar.copy}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
