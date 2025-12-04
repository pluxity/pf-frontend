import { type Ref } from "react";
import { Check } from "../../atoms/Icon";
import { cn } from "../../utils";

export interface StepperStepProps {
  title: string;
  description?: string;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepperStepProps[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  ref?: Ref<HTMLDivElement>;
}

function Stepper({ steps, currentStep, orientation = "horizontal", className, ref, ...props }: StepperProps) {
    const isHorizontal = orientation === "horizontal";

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          isHorizontal ? "flex-row items-start" : "flex-col",
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={index}
              className={cn(
                "flex",
                isHorizontal ? "flex-1 flex-col items-center" : "flex-row gap-4"
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  isHorizontal ? "w-full" : "flex-col"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                    isCompleted
                      ? "bg-brand text-white"
                      : isCurrent
                        ? "border-2 border-brand bg-white text-brand"
                        : "border-2 border-[#E6E6E8] bg-white text-[#808088]"
                  )}
                >
                  {isCompleted ? (
                    <Check size="md" />
                  ) : (
                    index + 1
                  )}
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      "transition-colors",
                      isHorizontal
                        ? "mx-2 h-0.5 flex-1"
                        : "ml-5 mt-2 h-12 w-0.5",
                      isCompleted ? "bg-brand" : "bg-[#E6E6E8]"
                    )}
                  />
                )}
              </div>

              <div
                className={cn(
                  isHorizontal ? "mt-3 text-center" : "flex-1 pb-8 last:pb-0"
                )}
              >
                <h4
                  className={cn(
                    "text-sm font-bold",
                    isCurrent || isCompleted ? "text-[#333340]" : "text-[#808088]"
                  )}
                >
                  {step.title}
                </h4>
                {step.description && (
                  <p className="mt-1 text-xs text-[#808088]">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
}

export { Stepper };
