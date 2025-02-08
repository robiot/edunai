import { useMutation } from "@tanstack/react-query";
import { FC } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

export const ImageDrop: FC = () => {
  const uploadImageToIPFS = useMutation({
    mutationKey: ["uploadImage"],
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("file", file);

      // todo: implement
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    // disabled: disabled,
    accept: {
      "image/png": [".png"],
    },
    multiple: false,
    onDropAccepted: async (files) => {
      const [file] = files;

      if (!file) return;

      await uploadImageToIPFS.mutate(file);
    },
    onDropRejected: () => {
      alert("File rejected. Incorrect file type or too big file.");
    },
  });

  return (
    <>
      <div
        className={cn(
          "py-4 border-border border items-center flex w-full justify-center h-48",
          "rounded-lg",
        )}
        {...getRootProps()}
      >
        <input
          className="bg-transparent border-none h-full top-0 left-0 hidden absolute w-full"
          {...getInputProps()}
        />

        <div className="flex flex-col text-center gap-4">
          <span className=" text-foreground/90">Drop your images here</span>
          <span className="text-sm text-foreground/60">
            (4:3) recommended, up to 10MB
          </span>
        </div>
      </div>
    </>
  );
};
