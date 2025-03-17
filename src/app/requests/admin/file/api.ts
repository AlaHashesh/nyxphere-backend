import axiosInstance from "@/app/requests/axiosInstance";
import { CONFIG } from "@/app/config";
import { UploadFileRequest } from "@/app/requests/admin/file/types";

const URL = `${CONFIG.baseUrl}/api/v1/admin/file/upload`;

export const uploadFile = async (payload: UploadFileRequest) => {
  const formData = new FormData();
  formData.append("file", payload.file);

  const config = {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress: payload.onUploadProgress,
    signal: payload.signal
  };

  try {
    const response = await axiosInstance.post(URL, formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};