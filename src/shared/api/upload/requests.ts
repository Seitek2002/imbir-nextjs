import { FILE_UPLOAD_TIMEOUT_MS, apiClient } from "../client";

export type UploadResponse = {
  url: string;
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<UploadResponse>("/api/upload/", form, {
    // Не задаём Content-Type вручную: браузер сам добавит boundary multipart.
    timeout: FILE_UPLOAD_TIMEOUT_MS,
  });
  return data;
};
