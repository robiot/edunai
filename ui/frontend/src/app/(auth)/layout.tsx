"use client";
import { FC, ReactNode } from "react";

import { AuthContext } from "@/components/common/AuthContext";

const LoginLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthContext>{children}</AuthContext>;
};

export default LoginLayout;
