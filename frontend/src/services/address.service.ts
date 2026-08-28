import { api, ApiResponse } from "./api";
import { SavedAddress, SavedAddressInput } from "../types/address.types";

export async function fetchAddresses(): Promise<SavedAddress[]> {
  const response = await api.get<ApiResponse<SavedAddress[]>>("/addresses");
  return response.data.data;
}

export async function createAddress(input: SavedAddressInput): Promise<SavedAddress> {
  const response = await api.post<ApiResponse<SavedAddress>>("/addresses", input);
  return response.data.data;
}

export async function updateAddress(
  id: string,
  input: Partial<SavedAddressInput>
): Promise<SavedAddress> {
  const response = await api.patch<ApiResponse<SavedAddress>>(`/addresses/${id}`, input);
  return response.data.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`);
}