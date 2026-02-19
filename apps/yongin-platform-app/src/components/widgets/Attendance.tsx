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
import { useAttendance } from "@/hooks";
import { AttendanceProps } from "./types";

const attendanceHeader = [
  { key: "deviceName", label: "구분" },
  { key: "attendanceCount", label: "출역인원" },
  { key: "workContent", label: "금일 작업 내용" },
] as const;

export function Attendance({ id, className }: AttendanceProps) {
  const { data, isLoading, isError, error } = useAttendance();

  if (isLoading) {
    return (
      <Widget id={id} className={cn(className, "")} contentClassName="h-full">
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
      <Widget id={id} className={cn(className, "")} contentClassName="h-full">
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
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="flex flex-col gap-2 h-full">
        <div className="font-bold">출역현황</div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto [&>div]:!border-0 [&_table]:!border-0 [&_tr]:!border-0 [&_td]:!border-0 [&_th]:!border-r-0">
            <Table>
              <TableHeader className="!border-y !border-neutral-300">
                <TableRow>
                  {attendanceHeader.map((header) => (
                    <TableHead key={header.key} className="bg-[#DAE4F4] text-[#55596C]">
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={attendanceHeader.length}
                      className="text-center text-neutral-500"
                    >
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>{data.deviceName}</TableCell>
                      <TableCell>{data.attendanceCount}</TableCell>
                      <TableCell>{data.workContent}</TableCell>
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
