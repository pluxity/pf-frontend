import {
  Widget,
  cn,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Spinner,
} from "@pf-dev/ui";
import { GoalProps } from "./types";
import { useGoal } from "@/hooks/useGoal";

export function Goal({ id, className }: GoalProps) {
  const { goals, isLoading, isError, error } = useGoal();

  const goalHeader = [
    { key: "section", label: "시공구간" },
    { key: "progressRate", label: "진행률" },
    { key: "targetQuantity", label: "목표량" },
    { key: "workQuantity", label: "작업량" },
    { key: "completionDate", label: "준공일" },
    { key: "delayDays", label: "지연일" },
  ] as const;

  if (isLoading) {
    return (
      <Widget id={id} className={cn(className, "4k:text-4xl 4k:p-8")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        </div>
      </Widget>
    );
  }

  if (isError) {
    return (
      <Widget id={id} className={cn(className, "4k:text-4xl 4k:p-8")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-500">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-gray-700">
              {error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다."}
            </p>
          </div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget id={id} className={cn(className, "4k:text-4xl 4k:p-8")} contentClassName="h-full">
      <div className="flex gap-4 h-full">
        <div className="font-bold 4k:text-4xl">목표관리</div>

        <div className="flex-1 overflow-hidden">
          <div className="max-h-[calc(4*2.25rem)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {goalHeader.map((header) => (
                    <TableHead key={header.key} className="bg-[#DAE4F4] text-[#55596C]">
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-neutral-500">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  goals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>{goal.constructionSectionName}</TableCell>
                      <TableCell>{goal.progressRate}%</TableCell>
                      <TableCell>{goal.targetQuantity.toLocaleString()}</TableCell>
                      <TableCell>{goal.workQuantity.toLocaleString()}</TableCell>
                      <TableCell>{goal.completionDate}</TableCell>
                      <TableCell>{goal.delayDays}일</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Widget>
  );
}
