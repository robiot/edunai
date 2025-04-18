import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProperties
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProperties>(
  ({ className, ...properties }, reference) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] overflow-hidden w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={reference}
        {...properties}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
