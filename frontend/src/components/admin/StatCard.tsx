import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none bg-secondary/30", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {trend && (
              <div className={cn(
                "flex items-center text-xs font-medium mt-1",
                trend.isUp ? "text-green-500" : "text-destructive"
              )}>
                <span>{trend.isUp ? '+' : '-'}{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground ml-1 font-normal text-[10px]">from last month</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-background/50 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
