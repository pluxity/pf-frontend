import { Children, createContext, useContext } from "react";
import { Check } from "../../atoms/Icon";
import { cn } from "../../utils";

interface StepperContextValue {
  currentStep: number;
  totalSteps: number;
  orientation: "horizontal" | "vertical";
}

const StepperContext = createContext<StepperContextValue | null>(null);

const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("Stepper compound components must be used within Stepper");
  }
  return context;
};

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Children (composition pattern) */
  children?: React.ReactNode;
  /** Current step index (0-based) */
  currentStep: number;
  /** Stepper orientation */
  orientation?: "horizontal" | "vertical";
}

export interface StepperStepProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
}

export interface StepperCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

function StepperCustom({ children, className }: StepperCustomProps) {
  const { orientation } = useStepperContext();
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "flex-1 flex-col items-center" : "flex-row gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

function Stepper({
  children,
  currentStep,
  orientation = "horizontal",
  className,
  ...props
}: StepperProps) {
  const isHorizontal = orientation === "horizontal";
  const childrenArray = Children.toArray(children);
  const totalSteps = childrenArray.length;

  const contextValue: StepperContextValue = {
    currentStep,
    totalSteps,
    orientation,
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        className={cn("flex", isHorizontal ? "flex-row items-start" : "flex-col", className)}
        {...props}
      >
        {childrenArray.map((child, index) => {
          if (child && typeof child === "object" && "type" in child) {
            return (
              <StepContext.Provider key={index} value={index}>
                {child}
              </StepContext.Provider>
            );
          }
          return child;
        })}
      </div>
    </StepperContext.Provider>
  );
}

const StepContext = createContext<number>(0);

function StepWithContext(props: StepperStepProps) {
  const stepIndex = useContext(StepContext);
  const { currentStep, totalSteps, orientation } = useStepperContext();

  const isCompleted = stepIndex < currentStep;
  const isCurrent = stepIndex === currentStep;
  const isLast = stepIndex === totalSteps - 1;
  const isHorizontal = orientation === "horizontal";

  const { title, description, className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "flex-1 flex-col items-center" : "flex-row gap-4",
        className
      )}
      {...rest}
    >
      <div className={cn("flex items-center", isHorizontal ? "w-full" : "flex-col")}>
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
          {isCompleted ? <Check size="md" /> : stepIndex + 1}
        </div>

        {!isLast && (
          <div
            className={cn(
              "transition-colors",
              isHorizontal ? "mx-2 h-0.5 flex-1" : "ml-5 mt-2 h-12 w-0.5",
              isCompleted ? "bg-brand" : "bg-[#E6E6E8]"
            )}
          />
        )}
      </div>

      <div className={cn(isHorizontal ? "mt-3 text-center" : "flex-1 pb-8 last:pb-0")}>
        <h4
          className={cn(
            "text-sm font-bold",
            isCurrent || isCompleted ? "text-[#333340]" : "text-[#808088]"
          )}
        >
          {title}
        </h4>
        {description && <p className="mt-1 text-xs text-[#808088]">{description}</p>}
      </div>
    </div>
  );
}

Stepper.Step = StepWithContext;
Stepper.Custom = StepperCustom;

export { Stepper, useStepperContext };
