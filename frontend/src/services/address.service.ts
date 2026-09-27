import { api } from "./api";
import { SavedAddress, SavedAddressInput } from "../types/address.types";

export async function fetchAddresses(): Promise<SavedAddress[]> {
  const response = await api.get("/addresses");
  return response.data.data as SavedAddress[];
}

export async function createAddress(input: SavedAddressInput): Promise<SavedAddress> {
  const response = await api.post("/addresses", input);
  return response.data.data as SavedAddress;
}

export async function updateAddress(
  id: string,
  input: Partial<SavedAddressInput>
): Promise<SavedAddress> {
  const response = await api.patch(`/addresses/${id}`, input);
  return response.data.data as SavedAddress;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`);
}