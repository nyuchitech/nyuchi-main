/**
 * Badge Component - shadcn/ui
 * For status indicators and tags
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Mineral variants
        cobalt:
          "border-transparent bg-[var(--mineral-cobalt)] text-white",
        tanzanite:
          "border-transparent bg-[var(--mineral-tanzanite)] text-white",
        malachite:
          "border-transparent bg-[var(--mineral-malachite)] text-white",
        gold:
          "border-transparent bg-[var(--mineral-gold)] text-white",
        terracotta:
          "border-transparent bg-[var(--mineral-terracotta)] text-white",
        // Status variants
        success:
          "border-transparent bg-[var(--zimbabwe-green)] text-white",
        warning:
          "border-transparent bg-[var(--zimbabwe-yellow)] text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
