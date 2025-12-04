import { type Ref } from "react";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";

export interface ErrorPageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "404" | "403" | "500" | "custom";
  errorCode?: string;
  title?: string;
  description?: string;
  illustration?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  ref?: Ref<HTMLDivElement>;
}

const defaultContent = {
  "404": {
    errorCode: "404",
    title: "페이지를 찾을 수 없습니다",
    description: "요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.",
  },
  "403": {
    errorCode: "403",
    title: "접근 권한이 없습니다",
    description: "이 페이지에 접근할 수 있는 권한이 없습니다. 관리자에게 문의하세요.",
  },
  "500": {
    errorCode: "500",
    title: "서버 오류가 발생했습니다",
    description: "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  },
  custom: {
    errorCode: "",
    title: "",
    description: "",
  },
};

function ErrorPage({
  variant = "404",
  errorCode,
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  className,
  ref,
  ...props
}: ErrorPageProps) {
  const defaults = defaultContent[variant];
  const displayCode = errorCode ?? defaults.errorCode;
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-md text-center">
        {illustration ? (
          <div className="mb-8">{illustration}</div>
        ) : (
          <div className="mb-8">
            <span className="text-8xl font-black text-gray-200">
              {displayCode}
            </span>
          </div>
        )}

        {displayTitle && (
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {displayTitle}
          </h1>
        )}

        {displayDescription && (
          <p className="mb-8 text-gray-500">{displayDescription}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { ErrorPage };
