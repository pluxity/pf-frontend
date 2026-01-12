import { Badge, Button } from "@pf-dev/ui";
import { type DataTableColumn } from "@pf-dev/ui/organisms";
import type { User } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../types";

interface GetColumnsOptions {
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function getUserColumns({
  onEdit,
  onDelete,
}: GetColumnsOptions = {}): DataTableColumn<User>[] {
  return [
    {
      key: "name",
      header: "이름",
      sortable: true,
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "email",
      header: "이메일",
      sortable: true,
      render: (row) => <span className="text-[#808088]">{row.email}</span>,
    },
    {
      key: "department",
      header: "부서",
      sortable: true,
    },
    {
      key: "role",
      header: "직책",
      sortable: true,
    },
    {
      key: "status",
      header: "상태",
      sortable: true,
      render: (row) => (
        <Badge variant={STATUS_COLORS[row.status]}>{STATUS_LABELS[row.status]}</Badge>
      ),
    },
    {
      key: "joinDate",
      header: "입사일",
      sortable: true,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
            >
              수정
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
            >
              삭제
            </Button>
          )}
        </div>
      ),
    },
  ];
}
