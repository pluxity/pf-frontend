import { useMemo } from "react";
import { Button, Edit, Close, Lock, MoreVertical } from "@pf-dev/ui/atoms";
import {
  DataTable,
  type DataTableColumn,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@pf-dev/ui/organisms";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@pf-dev/ui/molecules";
import type { User } from "../types";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UserTable({ users, onEdit, onDelete, onResetPassword }: UserTableProps) {
  const columns: DataTableColumn<User>[] = useMemo(
    () => [
      {
        key: "username",
        header: "아이디",
        sortable: true,
        className: "w-40",
      },
      {
        key: "name",
        header: "이름",
        sortable: true,
        className: "w-32",
      },
      {
        key: "department",
        header: "부서",
        sortable: true,
        className: "w-40",
        render: (user) => user.department || "-",
      },
      {
        key: "phoneNumber",
        header: "연락처",
        className: "w-40",
        render: (user) => user.phoneNumber || "-",
      },
      {
        key: "roles",
        header: "역할",
        render: (user) =>
          user.roles.length > 0 ? (
            user.roles.length === 1 ? (
              <span className="text-sm">{user.roles[0]?.name}</span>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer text-sm">
                    {user.roles[0]?.name}{" "}
                    <span className="text-blue-600 underline decoration-dotted hover:text-blue-800">
                      외 {user.roles.length - 1}개
                    </span>
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-1">
                    {user.roles.slice(1).map((role) => (
                      <div key={role.id} className="text-sm">
                        {role.name}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        key: "id",
        header: "작업",
        className: "w-12",
        render: (user) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size="sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit size="sm" className="mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(user)}>
                <Lock size="sm" className="mr-2" />
                비밀번호 초기화
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600">
                <Close size="sm" className="mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDelete, onResetPassword]
  );

  return <DataTable data={users} columns={columns} pagination pageSize={10} />;
}
