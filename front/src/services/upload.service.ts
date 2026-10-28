import { api } from "./api";

/** Uploads listing photos and returns their URLs in the same order as `files`. */
export async function uploadImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  const response = await api.post("/uploads/images", form);
  return (response.data.data as { urls: string[] }).urls;
}