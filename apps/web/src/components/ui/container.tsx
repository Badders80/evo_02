import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width variant. Default: page (1200px) */
  maxWidth?: "page" | "narrow" | "full";
  /** Horizontal padding. Default: px-6 md:px-8 lg:px-12 */
  padding?: "default" | "none" | "tight";
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = "page", padding = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        maxWidth === "page" && "max-w-[1200px]",
        maxWidth === "narrow" && "max-w-[760px]",
        maxWidth === "full" && "max-w-none",
        padding === "default" && "px-6 md:px-8 lg:px-12",
        padding === "tight" && "px-4 md:px-6",
        padding === "none" && "",
        className,
      )}
      {...props}
    />,
  ),
);
Container.displayName = "Container";

export { Container };