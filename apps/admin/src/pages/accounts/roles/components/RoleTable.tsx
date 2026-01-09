import { Badge, Button, Edit, Close } from "@pf-dev/ui/atoms";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
              <div className="flex flex-wrap justify-center gap-1">
                {role.permissions.length > 0 ? (
                  role.permissions.map((permission) => (
                    <Badge key={permission.id} variant="default">
                      {permission.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
