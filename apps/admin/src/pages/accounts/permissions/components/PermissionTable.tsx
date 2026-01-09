import { Badge } from "@pf-dev/ui/atoms";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@pf-dev/ui/organisms";
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

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "ADMIN":
        return "error";
      case "WRITE":
        return "warning";
      case "READ":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">권한명</TableHead>
          <TableHead className="text-left">설명</TableHead>
          <TableHead className="text-left">도메인 권한</TableHead>
          <TableHead className="text-left">리소스 권한</TableHead>
          <TableHead className="text-left">생성일</TableHead>
          <TableHead className="text-left">생성자</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((permission) => (
          <TableRow key={permission.id}>
            <TableCell className="text-left font-medium">{permission.name}</TableCell>
            <TableCell className="text-left">{permission.description || "-"}</TableCell>
            <TableCell className="text-left">
              <div className="flex flex-wrap gap-1">
                {permission.domainPermissions.map((dp, idx) => (
                  <Badge key={idx} variant={getLevelBadgeVariant(dp.level)}>
                    {dp.resourceType}:{dp.level}
                  </Badge>
                ))}
                {permission.domainPermissions.length === 0 && "-"}
              </div>
            </TableCell>
            <TableCell className="text-left">
              <div className="flex flex-wrap gap-1">
                {permission.resourcePermissions.map((rp, idx) => (
                  <Badge key={idx} variant={getLevelBadgeVariant(rp.level)}>
                    {rp.resourceType}#{rp.resourceId}:{rp.level}
                  </Badge>
                ))}
                {permission.resourcePermissions.length === 0 && "-"}
              </div>
            </TableCell>
            <TableCell className="text-left">{formatDate(permission.createdAt)}</TableCell>
            <TableCell className="text-left">{permission.createdBy}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
