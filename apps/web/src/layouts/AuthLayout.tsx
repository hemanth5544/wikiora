import { Outlet } from "react-router-dom"

import { BrandMark } from "@/components/brand/BrandMark"
import { ThemeToggle } from "@/components/ThemeToggle"

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container-app flex items-center justify-between py-4">
        <BrandMark />
        <ThemeToggle />
      </header>
      <main className="container-app flex min-h-[calc(100vh-5rem)] items-center justify-center py-10">
        <Outlet />
      </main>
    </div>
  )
}
