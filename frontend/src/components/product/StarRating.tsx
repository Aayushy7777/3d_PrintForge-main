import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  justify?: "start" | "center" | "end";
}

export function StarRating({ rating, max = 5, size = "md", className, justify = "start" }: StarRatingProps) {
  const sizeMap = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end"
  };

  return (
    <div className={cn("flex items-center space-x-0.5", justifyMap[justify], className)}>
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeMap[size],
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}
