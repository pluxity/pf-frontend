import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const createUserSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요").max(50, "아이디는 50자 이내로 입력해주세요"),
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상이어야 합니다")
    .max(100, "비밀번호는 100자 이내로 입력해주세요"),
  name: z.string().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내로 입력해주세요"),
  code: z.string().max(20, "사번은 20자 이내로 입력해주세요").optional(),
  phoneNumber: z.string().max(20, "연락처는 20자 이내로 입력해주세요").optional(),
  department: z.string().max(50, "부서명은 50자 이내로 입력해주세요").optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내로 입력해주세요"),
  code: z.string().max(20, "사번은 20자 이내로 입력해주세요").optional(),
  phoneNumber: z.string().max(20, "연락처는 20자 이내로 입력해주세요").optional(),
  department: z.string().max(50, "부서명은 50자 이내로 입력해주세요").optional(),
});

type CreateFormValues = z.infer<typeof createUserSchema>;
type UpdateFormValues = z.infer<typeof updateUserSchema>;

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

function CreateUserForm({
  availableRoles,
  onCreate,
  onCancel,
  isLoading,
  error,
}: {
  availableRoles: Role[];
  onCreate: (data: UserCreateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      code: "",
      phoneNumber: "",
      department: "",
    },
  });

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const onSubmit = async (data: CreateFormValues) => {
    try {
      await onCreate({
        ...data,
        roleIds: selectedRoleIds,
      });
      reset();
      setSelectedRoleIds([]);
    } catch {
      // 에러 발생 시 폼 유지
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader>
        <ModalTitle>새 사용자 등록</ModalTitle>
        <ModalDescription>새로운 사용자를 등록합니다.</ModalDescription>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div>
          <Label htmlFor="username">아이디 *</Label>
          <Input id="username" placeholder="로그인에 사용할 아이디" {...register("username")} />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password">비밀번호 *</Label>
          <Input
            id="password"
            type="password"
            placeholder="초기 비밀번호"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
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
                    id={`create-role-${role.id}`}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label htmlFor={`create-role-${role.id}`} className="cursor-pointer">
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
          {isLoading ? "등록 중..." : "등록"}
        </Button>
      </ModalFooter>
    </form>
  );
}

function UpdateUserForm({
  user,
  availableRoles,
  onUpdate,
  onCancel,
  isLoading,
  error,
}: {
  user: User;
  availableRoles: Role[];
  onUpdate: (data: UserUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(user.roles.map((r) => r.id));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      code: user.code || "",
      phoneNumber: user.phoneNumber || "",
      department: user.department || "",
    },
  });

  // 사용자 정보 변경 시 폼 초기화
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    reset({
      name: user.name,
      code: user.code || "",
      phoneNumber: user.phoneNumber || "",
      department: user.department || "",
    });
    setSelectedRoleIds(user.roles.map((r) => r.id));
  }, [user, reset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const onSubmit = async (data: UpdateFormValues) => {
    try {
      await onUpdate({
        ...data,
        roleIds: selectedRoleIds,
      });
    } catch {
      // 에러 발생 시 폼 유지
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader>
        <ModalTitle>사용자 수정</ModalTitle>
        <ModalDescription>{user.username} 사용자 정보를 수정합니다.</ModalDescription>
      </ModalHeader>
      <ModalBody className="space-y-4">
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
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
                    id={`update-role-${role.id}`}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label htmlFor={`update-role-${role.id}`} className="cursor-pointer">
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
          {isLoading ? "수정 중..." : "수정"}
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
          <UpdateUserForm
            key={user.id}
            user={user}
            availableRoles={availableRoles}
            onUpdate={onUpdate}
            onCancel={handleClose}
            isLoading={isLoading}
            error={error}
          />
        ) : onCreate ? (
          <CreateUserForm
            availableRoles={availableRoles}
            onCreate={onCreate}
            onCancel={handleClose}
            isLoading={isLoading}
            error={error}
          />
        ) : null}
      </ModalContent>
    </Modal>
  );
}
