"use client";
import { FC, ReactNode } from "react";

import { Navbar } from "@/components/assembled/Navbar/Navbar";
import { AuthContext } from "@/components/common/AuthContext";

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthContext>
      <Navbar />

      <div className="mb-24">{children}</div>
    </AuthContext>
  );
};

export default AppLayout;
