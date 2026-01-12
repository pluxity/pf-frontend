import { useState } from "react";
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
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    department: initialData?.department ?? "",
    role: initialData?.role ?? "",
    status: initialData?.status ?? "pending",
    joinDate: initialData?.joinDate ?? getDefaultJoinDate(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">부서</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleChange("department", value)}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">직책</Label>
          <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange("status", value as User["status"])}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="joinDate">입사일</Label>
          <Input
            id="joinDate"
            type="date"
            value={formData.joinDate}
            onChange={(e) => handleChange("joinDate", e.target.value)}
            required
          />
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
