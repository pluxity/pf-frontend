/**
 * 권한 테이블 컴포넌트
 */

import type { Permission } from "../types";

interface PermissionTableProps {
  permissions: Permission[];
}

export function PermissionTable({ permissions }: PermissionTableProps) {
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
              권한명
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              설명
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              생성일
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {permissions.map((permission) => (
            <tr key={permission.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {permission.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{permission.description || "-"}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(permission.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
