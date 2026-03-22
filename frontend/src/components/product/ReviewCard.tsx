import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2 } from "lucide-react";

import { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.profiles?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="py-6 border-b last:border-0 border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={review.profiles?.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h4 className="font-semibold mr-2">{review.profiles?.full_name}</h4>
              {review.is_verified_purchase && (
                <div className="flex items-center text-xs text-primary font-medium">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified Purchase
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      <h5 className="font-medium mb-2">{review.title}</h5>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {review.body}
      </p>
    </div>
  );
}
