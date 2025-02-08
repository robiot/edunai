import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProperties
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProperties>(
  ({ className, type, ...properties }, reference) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-lg border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
          className,
        )}
        ref={reference}
        {...properties}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
