import { FC, ReactNode } from "react";

export const SectionHeading: FC<{ children: ReactNode }> = ({ children }) => {
  return <h2 className="font-bold text-3xl">{children}</h2>;
};
