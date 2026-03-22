import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center py-10">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors",
              i < currentStep 
                ? "bg-primary border-primary text-primary-foreground" 
                : i === currentStep 
                  ? "border-primary text-primary ring-4 ring-primary/20" 
                  : "border-muted text-muted-foreground"
            )}>
              {i < currentStep ? <Check className="h-5 w-5" /> : <span>{i + 1}</span>}
            </div>
            <span className={cn(
              "text-xs font-medium mt-2 absolute transform translate-y-8",
              i === currentStep ? "text-primary" : "text-muted-foreground"
            )}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "h-0.5 w-16 sm:w-24 mx-2",
              i < currentStep ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
