import { getApiClient, type DataResponse } from "@pf-dev/api";
import {
  SafetyEquipmentResponse,
  SafetyEquipmentRequest,
  SafetyEquipmentUpdateRequest,
} from "../types";

// 안전 장비 목록 조회
export async function getSafetyEquipmentList(): Promise<SafetyEquipmentResponse[]> {
  const response =
    await getApiClient().get<DataResponse<SafetyEquipmentResponse[]>>("/safety-equipments");
  return response.data;
}

// 안전 장비 상세 조회
export async function getSafetyEquipmentItem(id: number): Promise<SafetyEquipmentResponse> {
  const response = await getApiClient().get<DataResponse<SafetyEquipmentResponse>>(
    `/safety-equipments/${id}`
  );
  return response.data;
}

// 안전 장비 삭제
export async function deleteSafetyEquipment(id: number): Promise<void> {
  await getApiClient().delete<void>(`/safety-equipments/${id}`);
}

// 안전 장비 수정
export async function updateSafetyEquipment(
  id: number,
  data: SafetyEquipmentUpdateRequest
): Promise<void> {
  await getApiClient().put<void>(`/safety-equipments/${id}`, data);
}

// 안전 장비 등록
export async function createSafetyEquipment(
  data: SafetyEquipmentRequest
): Promise<SafetyEquipmentResponse> {
  const response = await getApiClient().post<DataResponse<SafetyEquipmentResponse>>(
    `/safety-equipments`,
    data
  );
  return response.data;
}
