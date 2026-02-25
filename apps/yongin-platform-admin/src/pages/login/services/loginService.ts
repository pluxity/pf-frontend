import { getApiClient, type DataResponse } from "@pf-dev/api";

export async function getUsernames(): Promise<string[]> {
  const response = await getApiClient().get<DataResponse<string[]>>("/users/usernames");
  return response.data;
}
