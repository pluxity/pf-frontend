import { Badge, Button, Edit, Close, Lock, MoreVertical } from "@pf-dev/ui/atoms";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">아이디</TableHead>
          <TableHead className="text-center">이름</TableHead>
          <TableHead className="text-center">부서</TableHead>
          <TableHead className="text-center">연락처</TableHead>
          <TableHead className="text-center">역할</TableHead>
          <TableHead className="text-center">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="text-center">{user.username}</TableCell>
            <TableCell className="text-center">{user.name}</TableCell>
            <TableCell className="text-center">{user.department || "-"}</TableCell>
            <TableCell className="text-center">{user.phoneNumber || "-"}</TableCell>
            <TableCell className="text-center">
              <div className="flex flex-wrap justify-center gap-1">
                {user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={role.id} variant="default">
                      {role.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
