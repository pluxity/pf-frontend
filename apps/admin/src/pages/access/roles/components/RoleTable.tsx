import { Badge } from "@pf-dev/ui/atoms";
import type { Role } from "../types";

interface RoleTableProps {
  roles: Role[];
}

export function RoleTable({ roles }: RoleTableProps) {
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
              롤명
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              설명
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              권한
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              생성일
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {role.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{role.description || "-"}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <Badge key={permission.id} variant="default">
                      {permission.name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(role.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
