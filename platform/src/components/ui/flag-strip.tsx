import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Nyuchi Brand System v6
 * Zimbabwe Flag Strip - 4px vertical left edge
 *
 * The Zimbabwe flag strip is a key brand element that appears
 * on the left edge of cards, containers, and accent elements.
 */

export interface FlagStripProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position of the flag strip */
  position?: "left" | "top" | "right" | "bottom"
  /** Width/height of the strip */
  size?: "sm" | "default" | "lg"
}

const FlagStrip = React.forwardRef<HTMLDivElement, FlagStripProps>(
  ({ className, position = "left", size = "default", children, ...props }, ref) => {
    const sizeClasses = {
      sm: position === "left" || position === "right" ? "w-1" : "h-1",
      default: position === "left" || position === "right" ? "w-1" : "h-1",
      lg: position === "left" || position === "right" ? "w-1.5" : "h-1.5",
    }

    const positionClasses = {
      left: "left-0 top-0 bottom-0",
      right: "right-0 top-0 bottom-0",
      top: "top-0 left-0 right-0",
      bottom: "bottom-0 left-0 right-0",
    }

    const gradientDirection = {
      left: "to-b",
      right: "to-b",
      top: "to-r",
      bottom: "to-r",
    }

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div
          className={cn(
            "absolute",
            sizeClasses[size],
            positionClasses[position],
            `bg-gradient-${gradientDirection[position]}`
          )}
          style={{
            background: `linear-gradient(${
              position === "left" || position === "right" ? "to bottom" : "to right"
            },
              var(--zimbabwe-green) 0%,
              var(--zimbabwe-green) 28.5%,
              var(--zimbabwe-yellow) 28.5%,
              var(--zimbabwe-yellow) 42.8%,
              var(--zimbabwe-red) 42.8%,
              var(--zimbabwe-red) 57.1%,
              var(--zimbabwe-black) 57.1%,
              var(--zimbabwe-black) 71.4%,
              var(--zimbabwe-red) 71.4%,
              var(--zimbabwe-red) 85.7%,
              var(--zimbabwe-yellow) 85.7%,
              var(--zimbabwe-yellow) 100%
            )`,
          }}
          aria-hidden="true"
        />
        {children}
      </div>
    )
  }
)
FlagStrip.displayName = "FlagStrip"

/**
 * FlagStripCard - Card variant with integrated flag strip
 */
const FlagStripCard = React.forwardRef<
  HTMLDivElement,
  FlagStripProps
>(({ className, children, position = "left", ...props }, ref) => (
  <FlagStrip
    ref={ref}
    position={position}
    className={cn(
      "rounded-card border bg-card text-card-foreground shadow-sm overflow-hidden",
      position === "left" && "pl-2",
      position === "right" && "pr-2",
      position === "top" && "pt-2",
      position === "bottom" && "pb-2",
      className
    )}
    {...props}
  >
    {children}
  </FlagStrip>
))
FlagStripCard.displayName = "FlagStripCard"

export { FlagStrip, FlagStripCard }
