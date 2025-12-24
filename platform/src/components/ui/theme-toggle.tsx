"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, cycleTheme } = useTheme()

  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="w-5 h-5" />
      case "light":
        return <Sun className="w-5 h-5" />
      case "system":
        return <Monitor className="w-5 h-5" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark mode (click for light)"
      case "light":
        return "Light mode (click for system)"
      case "system":
        return "System mode (click for dark)"
    }
  }

  return (
    <button
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      className={cn(
        "flex items-center justify-center w-11 h-11 rounded-full",
        "bg-card border border-border text-foreground",
        "hover:bg-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {getIcon()}
    </button>
  )
}
