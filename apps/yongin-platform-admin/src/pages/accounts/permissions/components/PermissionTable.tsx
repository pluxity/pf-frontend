import { useMemo } from "react";
import { Badge, Button, Edit, Close } from "@pf-dev/ui/atoms";
import {
  DataTable,
  type DataTableColumn,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@pf-dev/ui/organisms";
import type { Permission } from "../types";

interface PermissionTableProps {
  permissions: Permission[];
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
}

const LEVEL_LABELS: Record<string, string> = {
  READ: "읽기",
  WRITE: "쓰기",
  ADMIN: "관리",
};

const MAX_VISIBLE_BADGES = 2;

interface PermissionBadge {
  resourceType: string;
  level: string;
  isDomain: boolean;
  count?: number;
}

function getPermissionBadges(permission: Permission): PermissionBadge[] {
  const badges: PermissionBadge[] = [];

  // 도메인 권한 (정렬)
  const sortedDomainPermissions = [...permission.domainPermissions].sort((a, b) =>
    a.resourceType.localeCompare(b.resourceType)
  );
  sortedDomainPermissions.forEach((dp) => {
    badges.push({
      resourceType: dp.resourceType,
      level: dp.level,
      isDomain: true,
    });
  });

  // 리소스 권한 그룹화
  const resourceGroupMap = new Map<string, { level: string; count: number }>();
  permission.resourcePermissions.forEach((rp) => {
    const key = `${rp.resourceType}:${rp.level}`;
    if (!resourceGroupMap.has(key)) {
      resourceGroupMap.set(key, { level: rp.level, count: 0 });
    }
    resourceGroupMap.get(key)!.count++;
  });

  // Map을 배열로 변환 후 정렬
  const resourceBadges: PermissionBadge[] = [];
  resourceGroupMap.forEach((value, key) => {
    const [resourceType = ""] = key.split(":");
    resourceBadges.push({
      resourceType,
      level: value.level,
      isDomain: false,
      count: value.count,
    });
  });
  resourceBadges.sort((a, b) => a.resourceType.localeCompare(b.resourceType));
  badges.push(...resourceBadges);

  return badges;
}

function PermissionScopeCell({ badges }: { badges: PermissionBadge[] }) {
  if (badges.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  const visibleBadges = badges.slice(0, MAX_VISIBLE_BADGES);
  const hiddenBadges = badges.slice(MAX_VISIBLE_BADGES);
  const hasMore = hiddenBadges.length > 0;

  const formatBadgeLabel = (badge: PermissionBadge) => {
    const level = LEVEL_LABELS[badge.level] || badge.level;
    return `${badge.resourceType}:${level}`;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {visibleBadges.map((badge, idx) => (
        <Badge
          key={idx}
          variant={badge.isDomain ? "primary" : "warning"}
          className="max-w-56 truncate px-3 py-1"
          title={formatBadgeLabel(badge)}
        >
          {formatBadgeLabel(badge)}
        </Badge>
      ))}
      {hasMore && (
        <Popover>
          <PopoverTrigger asChild>
            <span className="cursor-pointer text-blue-600 underline decoration-dotted hover:text-blue-800">
              외 {hiddenBadges.length}개
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-1">
              {hiddenBadges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Badge variant={badge.isDomain ? "primary" : "warning"} className="text-[10px]">
                    {badge.isDomain ? "도메인" : "리소스"}
                  </Badge>
                  <span>{formatBadgeLabel(badge)}</span>
                  {!badge.isDomain && badge.count && (
                    <span className="text-gray-400">({badge.count}개)</span>
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function PermissionTable({ permissions, onEdit, onDelete }: PermissionTableProps) {
  const columns: DataTableColumn<Permission>[] = useMemo(
    () => [
      {
        key: "name",
        header: "권한명",
        sortable: true,
        className: "w-32 font-medium",
      },
      {
        key: "description",
        header: "설명",
        sortable: true,
        render: (permission) => permission.description || "-",
      },
      {
        key: "domainPermissions",
        header: "권한 범위",
        className: "w-[30rem]",
        render: (permission) => {
          const badges = getPermissionBadges(permission);
          return <PermissionScopeCell badges={badges} />;
        },
      },
      {
        key: "id",
        header: "작업",
        className: "w-24",
        render: (permission) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(permission)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit size="sm" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(permission)}
              className="text-red-500 hover:text-red-700"
            >
              <Close size="sm" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return <DataTable data={permissions} columns={columns} pagination pageSize={10} />;
}
