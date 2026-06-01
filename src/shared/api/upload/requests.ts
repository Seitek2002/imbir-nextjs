import { apiClient } from "../client";

export type UploadResponse = {
  url: string;
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<UploadResponse>("/api/upload/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
