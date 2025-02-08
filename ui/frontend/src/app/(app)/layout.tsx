"use client";
import { FC, ReactNode } from "react";

import { Navbar } from "@/components/assembled/Navbar/Navbar";
import { AuthContext } from "@/components/common/AuthContext";

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthContext>
      <Navbar />
      {children}
    </AuthContext>
  );
};

export default AppLayout;
