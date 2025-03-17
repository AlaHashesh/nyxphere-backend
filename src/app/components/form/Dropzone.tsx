import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import DropzoneFile from "@/app/components/form/DropzoneFile";

const acceptTypes = {
  svg: ".svg",
  image: "image/*",
  audio: "audio/mpeg, audio/x-m4a"
};

type Props = {
  className?: string;
  multiple?: boolean;
  accept?: "svg" | "image" | "audio"
}

const Dropzone = (props: Props) => {
  const { className, multiple, accept } = props;
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    const file = rejectedFiles.filter((file) => {
      return file.errors.findIndex(error => error.code === "too-many-files") !== -1;
    }).map((file) => {
      return file.file;
    })?.[0];

    if (file) {
      onDrop([file]);
    }
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: multiple
  });

  const handleRemoveFile = (index: number) => {
    setFiles((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  if (files.length == 0) {
    return (
      <div {...getRootProps()} className={`${className} flex items-center justify-center w-full`}>
        <label htmlFor="dropzone-file"
               className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
            </svg>
            {isDragActive ? (
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Drop the files here ...</span>
              </p>
            ) : (
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            )}
          </div>
          <input {...getInputProps()} id="dropzone-file" type="file"
                 className="hidden" />
        </label>
      </div>
    );
  }

  return (
    <div className={className}>
      {
        files.map((file, index) => (
          <DropzoneFile key={`dropzone-${index}`} file={file} onRemove={() => handleRemoveFile(index)} />
        ))
      }
    </div>
  );
};

export default Dropzone;