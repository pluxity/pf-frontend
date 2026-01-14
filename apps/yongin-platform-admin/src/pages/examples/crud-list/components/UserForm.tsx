import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label } from "@pf-dev/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pf-dev/ui/molecules";
import type { User, UserFormData } from "../types";
import { DEPARTMENTS, ROLES, STATUS_OPTIONS } from "../types";

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  department: z.string().min(1, "부서를 선택해주세요"),
  role: z.string().min(1, "직책을 선택해주세요"),
  status: z.enum(["active", "inactive", "pending"]),
  joinDate: z.string().min(1, "입사일을 입력해주세요"),
});

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function getDefaultJoinDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

export function UserForm({ initialData, onSubmit, onCancel, isLoading }: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      role: "",
      status: "pending",
      joinDate: getDefaultJoinDate(),
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        department: initialData.department,
        role: initialData.role,
        status: initialData.status,
        joinDate: initialData.joinDate,
      });
    } else {
      reset({
        name: "",
        email: "",
        department: "",
        role: "",
        status: "pending",
        joinDate: getDefaultJoinDate(),
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  const currentDepartment = watch("department");
  const currentRole = watch("role");
  const currentStatus = watch("status");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            이름 <span className="text-red-500">*</span>
          </Label>
          <Input {...register("name")} id="name" placeholder="이름을 입력하세요" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            이메일 <span className="text-red-500">*</span>
          </Label>
          <Input {...register("email")} id="email" type="email" placeholder="이메일을 입력하세요" />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">
            부서 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={currentDepartment}
            onValueChange={(value) => setValue("department", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="부서 선택" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">
            직책 <span className="text-red-500">*</span>
          </Label>
          <Select value={currentRole} onValueChange={(value) => setValue("role", value)}>
            <SelectTrigger>
              <SelectValue placeholder="직책 선택" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            상태 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={currentStatus}
            onValueChange={(value) => setValue("status", value as UserFormData["status"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="joinDate">
            입사일 <span className="text-red-500">*</span>
          </Label>
          <Input {...register("joinDate")} id="joinDate" type="date" />
          {errors.joinDate && <p className="text-sm text-red-500">{errors.joinDate.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          취소
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "저장 중..." : initialData ? "수정" : "생성"}
        </Button>
      </div>
    </form>
  );
}
