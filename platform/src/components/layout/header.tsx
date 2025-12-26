"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Search, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/**
 * Nyuchi Navigation System
 * Based on Mukoko design with Nyuchi Brand v6
 */

// Public navigation links
const navLinks = [
  { href: "/community", label: "Community" },
  { href: "/community/directory", label: "Directory" },
  { href: "/community/travel-directory", label: "Travel" },
  { href: "/get-involved", label: "Get Involved" },
]

// Static page titles for scroll state
const pageTitles: Record<string, string> = {
  "/": "Home",
  "/community": "Community",
  "/community/directory": "Business Directory",
  "/community/travel-directory": "Travel Directory",
  "/community/leaderboard": "Leaderboard",
  "/community/content": "Content",
  "/get-involved": "Get Involved",
  "/get-involved/volunteer": "Volunteer",
  "/get-involved/student-program": "Student Program",
  "/get-involved/local-expert": "Local Expert",
  "/get-involved/business-partner": "Business Partner",
  "/sign-in": "Sign In",
  "/sign-up": "Sign Up",
}

// Zimbabwe flag strip for brand identity
function FlagStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-1 rounded-sm", className)}
      style={{
        background: `linear-gradient(to bottom,
          var(--zimbabwe-green) 0%,
          var(--zimbabwe-green) 14.28%,
          var(--zimbabwe-yellow) 14.28%,
          var(--zimbabwe-yellow) 28.56%,
          var(--zimbabwe-red) 28.56%,
          var(--zimbabwe-red) 42.84%,
          var(--zimbabwe-black) 42.84%,
          var(--zimbabwe-black) 57.12%,
          var(--zimbabwe-red) 57.12%,
          var(--zimbabwe-red) 71.4%,
          var(--zimbabwe-yellow) 71.4%,
          var(--zimbabwe-yellow) 85.68%,
          var(--zimbabwe-green) 85.68%,
          var(--zimbabwe-green) 100%
        )`,
      }}
    />
  )
}

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [pageTitle, setPageTitle] = useState<string | null>(null)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Page title detection (static mapping + dynamic H1)
  useEffect(() => {
    const staticTitle = pageTitles[pathname]
    if (staticTitle) {
      setPageTitle(staticTitle)
      return
    }

    // For dynamic pages, get title from first H1
    const getPageTitle = () => {
      const h1 = document.querySelector("h1")
      if (h1) {
        setPageTitle(h1.textContent || null)
      } else {
        setPageTitle(null)
      }
    }

    const timer = setTimeout(getPageTitle, 100)
    const observer = new MutationObserver(getPageTitle)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : ""
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Page Title */}
        <Link href="/" className="min-w-0 flex-shrink">
          <div className="relative h-[34px] flex items-center gap-2">
            {/* Logo with flag strip - visible when not scrolled */}
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                isScrolled && pageTitle
                  ? "opacity-0 absolute"
                  : "opacity-100"
              )}
            >
              <FlagStrip className="h-7" />
              <span className="text-[28px] font-serif font-bold text-primary">
                Nyuchi
              </span>
            </div>
            {/* Page title - visible when scrolled */}
            {pageTitle && (
              <span
                className={cn(
                  "text-lg font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px] transition-all duration-300",
                  isScrolled
                    ? "opacity-100"
                    : "opacity-0 absolute"
                )}
              >
                {pageTitle}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Pill-shaped Action Group */}
        <div className="flex items-center bg-primary rounded-full p-1 gap-1 flex-shrink-0">
          <Link
            href="/dashboard/directory/new"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
            aria-label="Add listing"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </Link>
          <Link
            href="/community/directory"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
            aria-label="Search directory"
          >
            <Search className="w-6 h-6 text-primary-foreground" />
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-background/20 hover:bg-background/30 transition-colors overflow-hidden"
              aria-label="Dashboard"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-semibold">
                  {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
              aria-label="Sign in"
            >
              <User className="w-6 h-6 text-primary-foreground" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
