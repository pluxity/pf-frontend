import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@pf-dev/ui/molecules";
import { Button, Input, Label } from "@pf-dev/ui/atoms";
import { useAuthStore, selectUser } from "@pf-dev/services";
import { changePassword } from "../../services/userService";
import { useToastContext } from "@/contexts";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "비밀번호는 영문과 숫자를 포함해야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordChangePage() {
  const user = useAuthStore(selectUser);
  const { toast } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        throw new Error("사용자 정보를 찾을 수 없습니다");
      }
      await changePassword(user.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
        variant: "success",
      });
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다";
      toast({
        title: "비밀번호 변경 실패",
        description: message,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">계정 관리</h1>
        <p className="text-muted-foreground">계정 정보 확인 및 비밀번호를 변경합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계정 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-muted-foreground">아이디</dt>
              <dd>{user?.username}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-muted-foreground">이름</dt>
              <dd>{user?.name}</dd>
            </div>
            {user?.department && (
              <div className="flex gap-2">
                <dt className="w-24 font-medium text-muted-foreground">부서</dt>
                <dd>{user.department}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
          <CardDescription>보안을 위해 주기적으로 비밀번호를 변경해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input id="currentPassword" type="password" {...register("currentPassword")} />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input id="newPassword" type="password" {...register("newPassword")} />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
