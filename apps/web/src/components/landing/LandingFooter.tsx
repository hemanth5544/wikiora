import { Link } from "react-router-dom"

import { BrandMark } from "@/components/brand/BrandMark"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Workspaces", href: "/app/workspaces" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Queries", href: "/app/queries" },
      { label: "Manage workspaces", href: "/app/workspaces/manage" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "Get started", href: "/sign-up" }],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-4 py-12 md:px-6">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div>
          <BrandMark variant="landing" />
          <p className="mt-4 max-w-xs type-body-sm text-body">
            Wikiora is a workspace Q&amp;A platform for teams that need clear questions, accountable answers, and
            controlled access.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 type-body-sm font-medium text-foreground">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("#") ? (
                    <a href={link.href} className="type-body-sm text-body hover:text-foreground">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="type-body-sm text-body hover:text-foreground">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-5xl type-body-sm text-muted-foreground">
        © {new Date().getFullYear()} Wikiora. All rights reserved.
      </p>
    </footer>
  )
}
