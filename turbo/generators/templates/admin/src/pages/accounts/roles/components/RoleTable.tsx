import { Button, Edit, Close } from "@pf-dev/ui/atoms";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-32 text-center font-bold">역할명</TableHead>
          <TableHead className="text-center font-bold">설명</TableHead>
          <TableHead className="w-48 text-center font-bold">권한</TableHead>
          <TableHead className="w-24 text-center font-bold">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="text-center font-medium">{role.name}</TableCell>
            <TableCell className="text-center">{role.description || "-"}</TableCell>
            <TableCell className="text-center">
              {role.permissions.length > 0 ? (
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
              )}
            </TableCell>
            <TableCell className="text-center">
              {role.name === "ADMIN" ? (
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
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
