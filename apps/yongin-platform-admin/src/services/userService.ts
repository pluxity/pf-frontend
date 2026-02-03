import { getApiClient } from "@pf-dev/api";

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * 비밀번호 변경
 * @param userId - 사용자 ID
 * @param data - 현재 비밀번호 및 새 비밀번호
 */
export async function changePassword(userId: number, data: ChangePasswordDto): Promise<void> {
  await getApiClient().put(`/users/${userId}/password`, data);
}
