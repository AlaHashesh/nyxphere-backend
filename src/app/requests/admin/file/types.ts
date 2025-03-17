import { AxiosProgressEvent } from "axios";

export type UploadFileRequest = {
  file: File;
  signal?: AbortSignal;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}