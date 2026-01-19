import { useMemo } from "react";
import { Button, Edit, Close } from "@pf-dev/ui/atoms";
import {
  DataTable,
  type DataTableColumn,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@pf-dev/ui/organisms";
import type { Role } from "../types";

interface RoleTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
  const columns: DataTableColumn<Role>[] = useMemo(
    () => [
      {
        key: "name",
        header: "역할명",
        sortable: true,
        className: "w-32 font-medium",
      },
      {
        key: "description",
        header: "설명",
        sortable: true,
        render: (role) => role.description || "-",
      },
      {
        key: "permissions",
        header: "권한",
        className: "w-48",
        render: (role) =>
          role.permissions.length > 0 ? (
            role.permissions.length === 1 ? (
              <span className="text-sm">{role.permissions[0]?.name}</span>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer text-sm">
                    {role.permissions[0]?.name}{" "}
                    <span className="text-blue-600 underline decoration-dotted hover:text-blue-800">
                      외 {role.permissions.length - 1}개
                    </span>
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-1">
                    {role.permissions.slice(1).map((permission) => (
                      <div key={permission.id} className="text-sm">
                        {permission.name}
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
        className: "w-24",
        render: (role) =>
          role.name === "ADMIN" ? (
            <span className="text-xs text-gray-400">보호됨</span>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(role)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(role)}
                className="text-red-600 hover:text-red-700"
              >
                <Close size="sm" />
              </Button>
            </div>
          ),
      },
    ],
    [onEdit, onDelete]
  );

  return <DataTable data={roles} columns={columns} pagination pageSize={10} />;
}
