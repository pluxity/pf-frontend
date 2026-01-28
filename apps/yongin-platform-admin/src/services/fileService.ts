import { getApiClient, type DataResponse } from "@pf-dev/api";
import { FileResponse } from "../types";

/**
 * 파일 업로드
 * @param file - 업로드할 파일
 * @returns 업로드된 파일 ID
 */
export async function uploadFile(file: File): Promise<number> {
  const formData = new FormData();
  formData.append("file", file);

  const result = await getApiClient().post<{ location: string }>("/files/upload", formData);
  const fileId = parseInt(result.location.split("/").pop() || "0", 10);

  return fileId;
}

/**
 * 파일 정보 조회
 * @param id - 파일 ID
 * @returns 파일 정보
 */
export async function getFile(id: number): Promise<FileResponse> {
  const response = await getApiClient().get<DataResponse<FileResponse>>(`/files/${id}`);
  return response.data;
}
