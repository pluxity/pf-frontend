import { useState } from "react";
import { Button, Badge, ChevronDown } from "@pf-dev/ui/atoms";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import { cn } from "@pf-dev/ui/utils";
import type { Permission } from "../types";

interface PermissionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
}

const LEVEL_LABELS: Record<string, string> = {
  READ: "읽기",
  WRITE: "쓰기",
  ADMIN: "관리",
};

const LEVEL_VARIANTS: Record<
  string,
  "default" | "primary" | "success" | "warning" | "error" | "outline"
> = {
  READ: "outline",
  WRITE: "warning",
  ADMIN: "error",
};

interface ResourceGroup {
  resourceType: string;
  level: string;
  resourceIds: string[];
}

function groupResourcePermissions(permission: Permission): ResourceGroup[] {
  const groups = new Map<string, { level: string; ids: string[] }>();

  permission.resourcePermissions.forEach((rp) => {
    const key = `${rp.resourceType}:${rp.level}`;
    if (!groups.has(key)) {
      groups.set(key, { level: rp.level, ids: [] });
    }
    groups.get(key)!.ids.push(rp.resourceId);
  });

  const result: ResourceGroup[] = [];
  groups.forEach((value, key) => {
    const [resourceType = ""] = key.split(":");
    result.push({
      resourceType,
      level: value.level,
      resourceIds: value.ids,
    });
  });

  return result;
}

export function PermissionDetailModal({
  open,
  onOpenChange,
  permission,
}: PermissionDetailModalProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (!permission) return null;

  const hasDomain = permission.domainPermissions.length > 0;
  const resourceGroups = groupResourcePermissions(permission);
  const hasResource = resourceGroups.length > 0;

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="text-center font-bold">권한 상세 정보</ModalTitle>
          <ModalDescription className="text-center">{permission.name}</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {permission.description && (
            <p className="text-sm text-gray-500">{permission.description}</p>
          )}

          {!hasDomain && !hasResource ? (
            <p className="text-center text-sm text-gray-400">설정된 권한이 없습니다.</p>
          ) : (
            <>
              {/* 도메인 권한 섹션 */}
              {hasDomain && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      도메인 권한
                    </span>
                    <span className="text-xs text-gray-400">타입 전체에 대한 권한</span>
                  </div>
                  <div className="space-y-2">
                    {permission.domainPermissions.map((dp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-3"
                      >
                        <span className="font-medium">{dp.resourceType}</span>
                        <Badge variant={LEVEL_VARIANTS[dp.level] || "outline"}>
                          {LEVEL_LABELS[dp.level] || dp.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 리소스 권한 섹션 */}
              {hasResource && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      리소스 권한
                    </span>
                    <span className="text-xs text-gray-400">개별 리소스에 대한 권한</span>
                  </div>
                  <div className="space-y-2">
                    {resourceGroups.map((group) => {
                      const key = `${group.resourceType}:${group.level}`;
                      const isExpanded = expandedGroups.has(key);

                      return (
                        <div key={key} className="rounded-lg border border-amber-200">
                          <button
                            type="button"
                            onClick={() => toggleGroup(key)}
                            className="flex w-full items-center justify-between bg-amber-50/50 p-3 hover:bg-amber-50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{group.resourceType}</span>
                              <Badge variant={LEVEL_VARIANTS[group.level] || "outline"}>
                                {LEVEL_LABELS[group.level] || group.level}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                ({group.resourceIds.length}개)
                              </span>
                            </div>
                            <ChevronDown
                              size="sm"
                              className={cn(
                                "text-gray-400 transition-transform duration-200",
                                isExpanded && "-rotate-180"
                              )}
                            />
                          </button>

                          {isExpanded && (
                            <div className="border-t border-amber-200 bg-white p-3">
                              <div className="grid grid-cols-2 gap-2">
                                {group.resourceIds.map((id) => (
                                  <div key={id} className="text-sm text-gray-600">
                                    #{id}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
