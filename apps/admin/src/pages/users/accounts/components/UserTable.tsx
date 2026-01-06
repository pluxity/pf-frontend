/**
 * 사용자 테이블 컴포넌트
 */

import { Badge, Button, Edit, Lock } from "@pf-dev/ui/atoms";
import type { User } from "../types";

interface UserTableProps {
  users: User[];
  onEditRoles: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UserTable({ users, onEditRoles, onResetPassword }: UserTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              이메일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              이름
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              롤
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              생성일
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{user.email}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{user.name}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="default">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEditRoles(user)}>
                    <Edit size="sm" />
                    <span className="ml-1">롤 수정</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onResetPassword(user)}>
                    <Lock size="sm" />
                    <span className="ml-1">비밀번호 초기화</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
