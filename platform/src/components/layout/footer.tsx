"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

/**
 * Nyuchi Footer
 * Ubuntu philosophy: "Ndiri nekuti tiri" (I am because we are)
 */

const footerLinks = [
  { href: "/community", label: "Community" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
]

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

export function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-20">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FlagStrip className="h-6" />
            <span className="text-2xl font-serif font-bold text-primary">Nyuchi</span>
          </div>
          <span className="font-serif italic text-sm text-muted-foreground">
            &ldquo;Ndiri nekuti tiri&rdquo;
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Theme Toggle + Attribution */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <ThemeToggle />
          <span>© {new Date().getFullYear()} Nyuchi Africa</span>
        </div>
      </div>

      {/* Ubuntu Philosophy */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8 pt-8 border-t border-border/50">
        <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          <span className="font-serif italic">&ldquo;I am because we are&rdquo;</span>
          {" "}&mdash;{" "}
          Nyuchi is built on the Ubuntu philosophy, connecting African businesses
          and diaspora communities to strengthen our collective success.
        </p>
      </div>
    </footer>
  )
}
