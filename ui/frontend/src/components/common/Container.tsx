import { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Container: FC<{
  children?: ReactNode;
  className?: string;
  noPadding?: boolean;
  size?: "xlarge" | "large" | "small";
}> = ({ children, className, noPadding, size = "large" }) => {
  return (
    <div
      className={cn(
        "h-full w-full mx-auto",
        !noPadding && "px-5 xl:px-0",
        size == "xlarge" && "max-w-6xl",
        size == "large" && "max-w-5xl",
        size == "small" && "max-w-[58rem]",

        className,
      )}
    >
      {children}
    </div>
  );
};
