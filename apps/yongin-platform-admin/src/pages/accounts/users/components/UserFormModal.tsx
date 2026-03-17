import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Button, Input, Label, Checkbox } from "@pf-dev/ui/atoms";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import type { User, UserCreateData, UserUpdateData, Role } from "../types";

const baseSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내로 입력해주세요"),
  code: z.string().max(20, "사번은 20자 이내로 입력해주세요").optional(),
  phoneNumber: z.string().max(20, "연락처는 20자 이내로 입력해주세요").optional(),
  department: z.string().max(50, "부서명은 50자 이내로 입력해주세요").optional(),
});

const createUserSchema = baseSchema.extend({
  username: z.string().min(1, "아이디를 입력해주세요").max(50, "아이디는 50자 이내로 입력해주세요"),
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상이어야 합니다")
    .max(100, "비밀번호는 100자 이내로 입력해주세요"),
});

const updateUserSchema = baseSchema;

type CreateFormValues = z.infer<typeof createUserSchema>;
type UpdateFormValues = z.infer<typeof updateUserSchema>;
type FormValues = CreateFormValues | UpdateFormValues;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  availableRoles: Role[];
  onCreate?: (data: UserCreateData) => Promise<void>;
  onUpdate?: (data: UserUpdateData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

type UserFormProps =
  | {
      mode: "create";
      user?: null;
      availableRoles: Role[];
      onSubmit: (data: UserCreateData) => Promise<void>;
      onCancel: () => void;
      isLoading?: boolean;
      error?: string | null;
    }
  | {
      mode: "edit";
      user: User;
      availableRoles: Role[];
      onSubmit: (data: UserUpdateData) => Promise<void>;
      onCancel: () => void;
      isLoading?: boolean;
      error?: string | null;
    };

const CREATE_DEFAULTS: CreateFormValues = {
  username: "",
  password: "",
  name: "",
  code: "",
  phoneNumber: "",
  department: "",
};

function getEditDefaults(user: User): UpdateFormValues {
  return {
    name: user.name,
    code: user.code || "",
    phoneNumber: user.phoneNumber || "",
    department: user.department || "",
  };
}

function UserForm(props: UserFormProps) {
  const { mode, availableRoles, onSubmit, onCancel, isLoading, error } = props;
  const user = mode === "edit" ? props.user : null;
  const isCreate = mode === "create";

  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(
    isCreate ? [] : (user?.roles.map((r) => r.id) ?? [])
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isCreate ? createUserSchema : updateUserSchema),
    defaultValues: isCreate ? CREATE_DEFAULTS : getEditDefaults(user!),
  });

  // 수정 모드: 사용자 정보 변경 시 폼 초기화
  useEffect(() => {
    if (!isCreate && user) {
      reset(getEditDefaults(user));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 모달 열림 시 폼 데이터 동기화
      setSelectedRoleIds(user.roles.map((r) => r.id));
    }
  }, [isCreate, user, reset]);

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleFormSubmit = async (data: FormValues) => {
    try {
      // 타입 안전하게 onSubmit 호출
      await (onSubmit as (data: FormValues & { roleIds: number[] }) => Promise<void>)({
        ...data,
        roleIds: selectedRoleIds,
      });
      if (isCreate) {
        reset(CREATE_DEFAULTS);
        setSelectedRoleIds([]);
      }
    } catch {
      // 에러 발생 시 폼 유지
    }
  };

  const roleIdPrefix = isCreate ? "create" : "update";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <ModalHeader>
        <ModalTitle>{isCreate ? "새 사용자 등록" : "사용자 수정"}</ModalTitle>
        <ModalDescription>
          {isCreate ? "새로운 사용자를 등록합니다." : `${user?.username} 사용자 정보를 수정합니다.`}
        </ModalDescription>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {isCreate && (
          <>
            <div>
              <Label htmlFor="username">아이디 *</Label>
              <Input
                id="username"
                placeholder="로그인에 사용할 아이디"
                {...register("username" as keyof FormValues)}
              />
              {"username" in errors && errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="초기 비밀번호"
                {...register("password" as keyof FormValues)}
              />
              {"password" in errors && errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </>
        )}

        <div>
          <Label htmlFor="name">이름 *</Label>
          <Input id="name" placeholder="사용자 이름" {...register("name")} />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="code">사번</Label>
          <Input id="code" placeholder="사번 (선택)" {...register("code")} />
        </div>
        <div>
          <Label htmlFor="phoneNumber">연락처</Label>
          <Input id="phoneNumber" placeholder="연락처 (선택)" {...register("phoneNumber")} />
        </div>
        <div>
          <Label htmlFor="department">부서</Label>
          <Input id="department" placeholder="부서명 (선택)" {...register("department")} />
        </div>
        <div>
          <Label>역할</Label>
          <p className="mb-2 text-sm text-gray-500">사용자에게 할당할 역할을 선택하세요.</p>
          <div className="space-y-2 rounded-lg border border-gray-200 p-3">
            {availableRoles.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 역할이 없습니다.</p>
            ) : (
              availableRoles.map((role) => (
                <div key={role.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`${roleIdPrefix}-role-${role.id}`}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label htmlFor={`${roleIdPrefix}-role-${role.id}`} className="cursor-pointer">
                    <span className="font-medium">{role.name}</span>
                    {role.description && (
                      <span className="ml-2 text-sm text-gray-400">({role.description})</span>
                    )}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          취소
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isCreate ? "등록 중..." : "수정 중...") : isCreate ? "등록" : "수정"}
        </Button>
      </ModalFooter>
    </form>
  );
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  availableRoles,
  onCreate,
  onUpdate,
  isLoading,
  error,
}: UserFormModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-md">
        {user && onUpdate ? (
          <UserForm
            key={user.id}
            mode="edit"
            user={user}
            availableRoles={availableRoles}
            onSubmit={onUpdate}
            onCancel={handleClose}
            isLoading={isLoading}
            error={error}
          />
        ) : onCreate ? (
          <UserForm
            mode="create"
            availableRoles={availableRoles}
            onSubmit={onCreate}
            onCancel={handleClose}
            isLoading={isLoading}
            error={error}
          />
        ) : null}
      </ModalContent>
    </Modal>
  );
}
