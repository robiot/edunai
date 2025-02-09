/* eslint-disable unicorn/prevent-abbreviations */
"use client";

import { motion } from "framer-motion";
import { FileIcon, X } from "lucide-react";
import React, { useEffect } from "react";

interface FilePreviewProperties {
  file: File;
  onRemove?: () => void;
}

export const FilePreview = React.forwardRef<
  HTMLDivElement,
  FilePreviewProperties
>((properties, reference) => {
  if (properties.file.type.startsWith("image/")) {
    return <ImageFilePreview {...properties} ref={reference} />;
  }

  if (
    properties.file.type.startsWith("text/") ||
    properties.file.name.endsWith(".txt") ||
    properties.file.name.endsWith(".md")
  ) {
    return <TextFilePreview {...properties} ref={reference} />;
  }

  return <GenericFilePreview {...properties} ref={reference} />;
});
FilePreview.displayName = "FilePreview";

const ImageFilePreview = React.forwardRef<
  HTMLDivElement,
  FilePreviewProperties
>(({ file, onRemove }, reference) => {
  return (
    <motion.div
      ref={reference}
      className="relative flex max-w-[200px] rounded-md border border-neutral-200 p-1.5 pr-2 text-xs dark:border-neutral-800"
      layout
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
    >
      <div className="flex w-full items-center space-x-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`Attachment ${file.name}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-neutral-200 bg-neutral-100 object-cover dark:border-neutral-800 dark:bg-neutral-800"
          src={URL.createObjectURL(file)}
        />
        <span className="w-full truncate text-neutral-500 dark:text-neutral-400">
          {file.name}
        </span>
      </div>

      {onRemove ? (
        <button
          className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          type="button"
          onClick={onRemove}
          aria-label="Remove attachment"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </motion.div>
  );
});

ImageFilePreview.displayName = "ImageFilePreview";

const TextFilePreview = React.forwardRef<HTMLDivElement, FilePreviewProperties>(
  ({ file, onRemove }, reference) => {
    const [preview, setPreview] = React.useState<string>("");

    useEffect(() => {
      const reader = new FileReader();

      reader.addEventListener("load", (e) => {
        const text = e.target?.result as string;

        setPreview(text.slice(0, 50) + (text.length > 50 ? "..." : ""));
      });
      reader.readAsText(file);
    }, [file]);

    return (
      <motion.div
        ref={reference}
        className="relative flex max-w-[200px] rounded-md border border-neutral-200 p-1.5 pr-2 text-xs dark:border-neutral-800"
        layout
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
      >
        <div className="flex w-full items-center space-x-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-800 dark:bg-neutral-800">
            <div className="h-full w-full overflow-hidden text-[6px] leading-none text-neutral-500 dark:text-neutral-400">
              {preview || "Loading..."}
            </div>
          </div>
          <span className="w-full truncate text-neutral-500 dark:text-neutral-400">
            {file.name}
          </span>
        </div>

        {onRemove ? (
          <button
            className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
            type="button"
            onClick={onRemove}
            aria-label="Remove attachment"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </motion.div>
    );
  },
);

TextFilePreview.displayName = "TextFilePreview";

const GenericFilePreview = React.forwardRef<
  HTMLDivElement,
  FilePreviewProperties
>(({ file, onRemove }, reference) => {
  return (
    <motion.div
      ref={reference}
      className="relative flex max-w-[200px] rounded-md border border-neutral-200 p-1.5 pr-2 text-xs dark:border-neutral-800"
      layout
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
    >
      <div className="flex w-full items-center space-x-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
          <FileIcon className="h-6 w-6 text-neutral-950 dark:text-neutral-50" />
        </div>
        <span className="w-full truncate text-neutral-500 dark:text-neutral-400">
          {file.name}
        </span>
      </div>

      {onRemove ? (
        <button
          className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          type="button"
          onClick={onRemove}
          aria-label="Remove attachment"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </motion.div>
  );
});

GenericFilePreview.displayName = "GenericFilePreview";
