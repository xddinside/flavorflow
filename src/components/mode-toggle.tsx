"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const {theme, setTheme } = useTheme()

  function toggleTheme() {
    if (theme == "light") {
      setTheme("dark")
    } else if (theme == "dark") {
      setTheme("light")
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={() => toggleTheme()}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

