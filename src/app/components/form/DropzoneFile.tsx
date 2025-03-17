import { DocumentIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useAdminUploadFile } from "@/app/requests/admin/file";
import { useEffect } from "react";

const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

type Props = {
  file: File;
  onRemove?: () => void;
}

const DropzoneFile = (props: Props) => {
  const { onRemove, file } = props;

  const { mutateAsync: uploadFile, progress } = useAdminUploadFile();


  useEffect(() => {
    const abortController = new AbortController();
    uploadFile({
      file: props.file,
      signal: abortController.signal
    }).then()
      .catch(console.error);

    return () => {
      abortController.abort();
    };
  }, [props.file, uploadFile]);

  return (
    <div>
      <div className="mb-2 flex justify-between items-center gap-3">
        <div className="flex items-center gap-x-3">
          <div
            className="size-8 flex justify-center items-center ">
            <DocumentIcon />
          </div>
          <div>
            <p className="text-xs text-gray-800 dark:text-white">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-x-2">
          <button type="button"
                  onClick={() => onRemove?.()}
                  className={`relative text-gray-500 hover:text-gray-800 focus:outline-hidden 
                        focus:text-gray-800 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-500 
                        dark:hover:text-neutral-200 dark:focus:text-neutral-200 cursor-pointer`}>
            <TrashIcon className={`size-4`} />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-x-3 whitespace-nowrap">
        <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700"
             role="progressbar">
          <div
            className="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500 dark:bg-blue-500"
            style={{ width: `${progress}%` }}>
          </div>
        </div>
        <div className="w-6 text-end">
          <span className="text-sm text-gray-800 dark:text-white">{`${progress}%`}</span>
        </div>
      </div>
    </div>
  );
};

export default DropzoneFile;