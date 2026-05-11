import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import type { RootState } from "@/store"
import { setTheme, type ThemeMode } from "@/store/uiSlice"

const storageKey = "wikiora-theme"

function resolveInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(storageKey)
  if (stored === "light" || stored === "dark") {
    return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeInit() {
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.ui.theme)

  useEffect(() => {
    dispatch(setTheme(resolveInitialTheme()))
  }, [dispatch])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem(storageKey, theme)
  }, [theme])

  return null
}
