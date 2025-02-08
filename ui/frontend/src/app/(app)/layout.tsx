"use client";
import { FC, ReactNode } from "react";

import { Navbar } from "@/components/assembled/Navbar/Navbar";
import { AuthContext } from "@/components/common/AuthContext";

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthContext>
      <div className="min-h-screen flex flex-col flex-1">
        <Navbar />

        {children}
      </div>
    </AuthContext>
  );
};

export default AppLayout;
