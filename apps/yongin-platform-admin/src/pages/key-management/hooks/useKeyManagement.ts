import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { KeyManagementType, KeyManagementRequest, KeyManagementUpdateRequest } from "../types";
import {
  getKeyManagementList,
  getKeyManagementTypes,
  createKeyManagement,
  updateKeyManagement,
  selectKeyManagement,
  deselectKeyManagement,
  deleteKeyManagement,
} from "../services";

const API_PATH = {
  KEY_MANAGEMENT: "/key-management",
  TYPES: "/key-management/types",
} as const;

/**
 * KeyManagement 데이터 관리 훅
 */
export function useKeyManagement() {
  // 전체 목록 조회 (그룹별)
  const {
    data: groupsData,
    error: dataError,
    isLoading: isLoadingData,
    mutate: refreshData,
  } = useSWR(API_PATH.KEY_MANAGEMENT, () => getKeyManagementList(), {
    revalidateOnFocus: false,
  });

  // 타입 목록 조회
  const {
    data: types = [],
    error: typesError,
    isLoading: isLoadingTypes,
  } = useSWR(API_PATH.TYPES, getKeyManagementTypes, {
    revalidateOnFocus: false,
  });

  // 생성
  const { trigger: create, isMutating: isCreating } = useSWRMutation(
    API_PATH.KEY_MANAGEMENT,
    (_key, { arg }: { arg: KeyManagementRequest }) => createKeyManagement(arg)
  );

  // 수정
  const { trigger: update, isMutating: isUpdating } = useSWRMutation(
    API_PATH.KEY_MANAGEMENT,
    (_key, { arg }: { arg: { id: number; data: KeyManagementUpdateRequest } }) =>
      updateKeyManagement(arg.id, arg.data)
  );

  // 선택
  const { trigger: select } = useSWRMutation(
    API_PATH.KEY_MANAGEMENT,
    (_key, { arg }: { arg: number }) => selectKeyManagement(arg)
  );

  // 선택 해제
  const { trigger: deselect } = useSWRMutation(
    API_PATH.KEY_MANAGEMENT,
    (_key, { arg }: { arg: number }) => deselectKeyManagement(arg)
  );

  // 삭제
  const { trigger: remove, isMutating: isDeleting } = useSWRMutation(
    API_PATH.KEY_MANAGEMENT,
    (_key, { arg }: { arg: number }) => deleteKeyManagement(arg)
  );

  return {
    // 데이터
    data: groupsData ?? [],
    types: types as KeyManagementType[],

    // 상태
    isLoading: isLoadingData || isLoadingTypes,
    isError: !!dataError || !!typesError,
    error: dataError || typesError,
    isSaving: isCreating || isUpdating || isDeleting,

    // 액션
    create,
    update,
    select,
    deselect,
    remove,
    refreshData,
  };
}
