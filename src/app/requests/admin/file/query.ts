import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { uploadFile } from "@/app/requests/admin/file/api";
import { AxiosProgressEvent } from "axios";
import { UploadFileRequest } from "@/app/requests/admin/file/types";

export const useAdminUploadFile = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: ({ file, signal }: UploadFileRequest) => {
      return uploadFile({
        file: file,
        signal: signal,
        onUploadProgress: (ev: AxiosProgressEvent) => {
          if (ev.total) {
            setProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        }
      });
    }
  });

  return { ...mutation, progress };
};