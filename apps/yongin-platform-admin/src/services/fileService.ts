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

  const lastSegment = result.location?.split("/").pop();
  const fileId = parseInt(lastSegment || "", 10);

  if (isNaN(fileId)) {
    throw new Error(`업로드 후 잘못된 파일 ID를 받았습니다: ${result.location}`);
  }

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
