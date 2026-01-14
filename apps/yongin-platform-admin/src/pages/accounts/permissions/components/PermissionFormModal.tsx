import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label, Textarea, Checkbox, ChevronDown } from "@pf-dev/ui/atoms";
import { cn } from "@pf-dev/ui/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@pf-dev/ui/molecules";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import type {
  Permission,
  PermissionFormData,
  ResourceTypeInfo,
  PermissionLevelType,
} from "../types";

const permissionSchema = z.object({
  name: z.string().min(1, "권한명을 입력해주세요").max(50, "권한명은 50자 이내로 입력해주세요"),
  description: z.string().max(200, "설명은 200자 이내로 입력해주세요").optional(),
});

type FormValues = z.infer<typeof permissionSchema>;

interface PermissionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PermissionFormData) => Promise<void>;
  resourceTypes: ResourceTypeInfo[];
  isLoading?: boolean;
  editingPermission?: Permission | null;
}

const PERMISSION_LEVELS: { value: PermissionLevelType; label: string }[] = [
  { value: "READ", label: "읽기" },
  { value: "WRITE", label: "쓰기" },
  { value: "ADMIN", label: "관리" },
];

export function PermissionFormModal({
  open,
  onOpenChange,
  onSubmit,
  resourceTypes,
  isLoading,
  editingPermission,
}: PermissionFormModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedResources, setSelectedResources] = useState<Record<string, Set<string>>>({});
  const [levelByType, setLevelByType] = useState<Record<string, PermissionLevelType>>({});
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const isEditMode = !!editingPermission;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // 모달이 열릴 때 폼 초기화
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      if (editingPermission) {
        // 수정 모드: 기존 데이터로 초기화
        reset({
          name: editingPermission.name,
          description: editingPermission.description || "",
        });

        const types = new Set<string>();
        const resources: Record<string, Set<string>> = {};
        const levels: Record<string, PermissionLevelType> = {};

        // 도메인 권한 (전체 리소스) 처리
        editingPermission.domainPermissions.forEach((dp) => {
          types.add(dp.resourceType);
          levels[dp.resourceType] = dp.level;
          // 전체 선택이므로 해당 타입의 모든 리소스 선택
          const rt = resourceTypes.find((r) => r.key === dp.resourceType);
          if (rt && rt.resources.length > 0) {
            resources[dp.resourceType] = new Set(rt.resources.map((r) => String(r.id)));
          }
        });

        // 개별 리소스 권한 처리
        editingPermission.resourcePermissions.forEach((rp) => {
          if (!resources[rp.resourceType]) {
            resources[rp.resourceType] = new Set();
          }
          resources[rp.resourceType]!.add(rp.resourceId);
          if (!levels[rp.resourceType]) {
            levels[rp.resourceType] = rp.level;
          }
        });

        // 나머지 타입들 기본 레벨 설정
        resourceTypes.forEach((rt) => {
          if (!levels[rt.key]) {
            levels[rt.key] = "READ";
          }
        });

        setSelectedTypes(types);
        setSelectedResources(resources);
        setLevelByType(levels);
        // 개별 리소스가 선택된 타입만 펼침 (전체 선택은 펼치지 않음)
        const expanded = new Set<string>();
        Object.entries(resources).forEach(([typeKey, ids]) => {
          const rt = resourceTypes.find((r) => r.key === typeKey);
          if (rt && ids.size > 0 && ids.size < rt.resources.length) {
            expanded.add(typeKey);
          }
        });
        setExpandedTypes(expanded);
      } else {
        // 생성 모드: 빈 폼으로 초기화
        reset({ name: "", description: "" });
        setSelectedTypes(new Set());
        setSelectedResources({});
        setExpandedTypes(new Set());
        const initialLevels: Record<string, PermissionLevelType> = {};
        resourceTypes.forEach((rt) => {
          initialLevels[rt.key] = "READ";
        });
        setLevelByType(initialLevels);
      }
    }
  }, [open, editingPermission, resourceTypes, reset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTypeCheck = (typeKey: string, checked: boolean) => {
    const rt = resourceTypes.find((r) => r.key === typeKey);
    if (!rt) return;

    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(typeKey);
      } else {
        next.delete(typeKey);
      }
      return next;
    });

    // 리소스 타입 체크 시 모든 하위 리소스도 체크/해제
    if (rt.resources && rt.resources.length > 0) {
      setSelectedResources((prev) => {
        if (checked) {
          return {
            ...prev,
            [typeKey]: new Set(rt.resources.map((r) => String(r.id))),
          };
        } else {
          const next = { ...prev };
          delete next[typeKey];
          return next;
        }
      });
    }
  };

  const handleResourceCheck = (typeKey: string, resourceId: string, checked: boolean) => {
    const rt = resourceTypes.find((r) => r.key === typeKey);
    if (!rt) return;

    setSelectedResources((prev) => {
      const currentSet = new Set(prev[typeKey] || []);
      if (checked) {
        currentSet.add(resourceId);
      } else {
        currentSet.delete(resourceId);
      }

      // 모든 리소스가 선택되면 타입도 선택, 하나도 없으면 타입 해제
      const allSelected = rt.resources.length > 0 && currentSet.size === rt.resources.length;
      const noneSelected = currentSet.size === 0;

      setSelectedTypes((prevTypes) => {
        const next = new Set(prevTypes);
        if (allSelected) {
          next.add(typeKey);
        } else if (noneSelected) {
          next.delete(typeKey);
        }
        return next;
      });

      return { ...prev, [typeKey]: currentSet };
    });
  };

  const isTypeChecked = (typeKey: string) => {
    return selectedTypes.has(typeKey);
  };

  const isResourceChecked = (typeKey: string, resourceId: string) => {
    return selectedResources[typeKey]?.has(resourceId) || false;
  };

  const isTypeIndeterminate = (typeKey: string) => {
    const rt = resourceTypes.find((r) => r.key === typeKey);
    if (!rt || !rt.resources || rt.resources.length === 0) return false;

    const selectedCount = selectedResources[typeKey]?.size || 0;
    return selectedCount > 0 && selectedCount < rt.resources.length;
  };

  const handleLevelChange = (key: string, level: PermissionLevelType) => {
    setLevelByType((prev) => ({ ...prev, [key]: level }));
  };

  const toggleExpanded = (typeKey: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(typeKey)) {
        next.delete(typeKey);
      } else {
        next.add(typeKey);
      }
      return next;
    });
  };

  const handleFormSubmit = async (data: FormValues) => {
    const permissions: Array<{
      resourceType: "NONE" | "FACILITY" | "CCTV" | "TEMPERATURE_HUMIDITY";
      resourceIds: string[];
      level: PermissionLevelType;
    }> = [];

    // 선택된 타입들에 대해 권한 생성
    for (const typeKey of selectedTypes) {
      const rt = resourceTypes.find((r) => r.key === typeKey);
      if (!rt) continue;

      const selectedIds = selectedResources[typeKey];
      const isAllSelected =
        !rt.resources ||
        rt.resources.length === 0 ||
        (selectedIds && selectedIds.size === rt.resources.length);

      permissions.push({
        resourceType: typeKey as "NONE" | "FACILITY" | "CCTV" | "TEMPERATURE_HUMIDITY",
        resourceIds: isAllSelected ? [] : Array.from(selectedIds || []),
        level: levelByType[typeKey] || "READ",
      });
    }

    // 타입은 선택 안했지만 개별 리소스만 선택한 경우
    for (const [typeKey, resourceIds] of Object.entries(selectedResources)) {
      if (selectedTypes.has(typeKey)) continue;
      if (resourceIds.size === 0) continue;

      permissions.push({
        resourceType: typeKey as "NONE" | "FACILITY" | "CCTV" | "TEMPERATURE_HUMIDITY",
        resourceIds: Array.from(resourceIds),
        level: levelByType[typeKey] || "READ",
      });
    }

    if (permissions.length === 0) {
      return;
    }

    await onSubmit({
      ...data,
      permissions,
    });
    reset();
  };

  const getActiveTypes = useMemo(() => {
    const types = new Set<string>();
    selectedTypes.forEach((t) => types.add(t));
    Object.entries(selectedResources).forEach(([typeKey, resources]) => {
      if (resources.size > 0) types.add(typeKey);
    });
    return Array.from(types);
  }, [selectedTypes, selectedResources]);

  const hasSelectedPermissions = getActiveTypes.length > 0;

  const handleClose = () => {
    reset();
    setSelectedTypes(new Set());
    setSelectedResources({});
    setExpandedTypes(new Set());
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-xl">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <ModalTitle className="text-center font-bold">
              {isEditMode ? "권한 수정" : "새 권한 생성"}
            </ModalTitle>
            <ModalDescription className="text-center">
              {isEditMode ? "권한 정보를 수정합니다." : "새로운 권한을 생성합니다."}
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="name">권한명 *</Label>
              <Input id="name" placeholder="예: 시설 관리자, CCTV 뷰어" {...register("name")} />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="권한에 대한 설명을 입력해주세요"
                rows={2}
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div>
              <Label>리소스 권한 *</Label>
              <p className="mb-2 text-sm text-gray-500">
                리소스 타입을 선택하면 하위 리소스를 개별 선택할 수 있습니다.
              </p>
              {resourceTypes.length === 0 ? (
                <div className="rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-400">
                  리소스 타입이 없습니다.
                </div>
              ) : (
                <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {resourceTypes.map((rt) => {
                    const hasResources = rt.resources && rt.resources.length > 0;
                    const isExpanded = expandedTypes.has(rt.key);

                    return (
                      <div key={rt.key} className="space-y-1">
                        {/* 리소스 타입 체크박스 */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`type-${rt.key}`}
                            checked={
                              isTypeIndeterminate(rt.key) ? "indeterminate" : isTypeChecked(rt.key)
                            }
                            onCheckedChange={(checked) => handleTypeCheck(rt.key, checked === true)}
                          />
                          <label
                            htmlFor={`type-${rt.key}`}
                            className="flex-1 cursor-pointer text-sm font-medium"
                          >
                            {rt.name}
                            {hasResources && (
                              <span className="ml-1 text-gray-400">({rt.resources.length})</span>
                            )}
                          </label>
                          {hasResources && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(rt.key)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <ChevronDown
                                size="sm"
                                className={cn(
                                  "transition-transform duration-200",
                                  isExpanded && "-rotate-180"
                                )}
                              />
                            </button>
                          )}
                        </div>

                        {/* 하위 리소스 체크박스들 */}
                        {hasResources && isExpanded && (
                          <div className="ml-6 grid grid-cols-2 gap-1 rounded-md bg-gray-50 p-2">
                            {rt.resources.map((resource) => (
                              <div key={resource.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={`resource-${rt.key}-${resource.id}`}
                                  checked={isResourceChecked(rt.key, String(resource.id))}
                                  onCheckedChange={(checked) =>
                                    handleResourceCheck(
                                      rt.key,
                                      String(resource.id),
                                      checked === true
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`resource-${rt.key}-${resource.id}`}
                                  className="cursor-pointer text-xs text-gray-600"
                                >
                                  {resource.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {getActiveTypes.length > 0 && (
              <div>
                <Label>권한 레벨 설정</Label>
                <p className="mb-2 text-sm text-gray-500">
                  선택된 리소스 타입별 권한 레벨을 설정하세요.
                </p>
                <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                  {getActiveTypes.map((typeKey) => {
                    const rt = resourceTypes.find((r) => r.key === typeKey);
                    if (!rt) return null;

                    const selectedCount = selectedResources[typeKey]?.size || 0;
                    const isAllSelected =
                      !rt.resources ||
                      rt.resources.length === 0 ||
                      selectedCount === rt.resources.length;

                    return (
                      <div
                        key={typeKey}
                        className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{rt.name}</span>
                          {isAllSelected ? (
                            <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                              도메인 권한
                            </span>
                          ) : (
                            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                              리소스 권한 ({selectedCount}개)
                            </span>
                          )}
                        </div>
                        <Select
                          value={levelByType[typeKey] || "READ"}
                          onValueChange={(value) =>
                            handleLevelChange(typeKey, value as PermissionLevelType)
                          }
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERMISSION_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || !hasSelectedPermissions}>
              {isLoading
                ? isEditMode
                  ? "수정 중..."
                  : "생성 중..."
                : isEditMode
                  ? "수정"
                  : "생성"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
