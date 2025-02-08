"use client";

import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, useEffect } from "react";
import { useAccount } from "wagmi";

export const AuthContext: FC<{ children: ReactNode }> = ({ children }) => {
  const account = useAccount();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (account.status == "disconnected") {
      router.push("/login");
    } else if (pathname == "/login" && account.status == "connected") {
      router.push("/");
    }
  }, [account.status]);

  return <>{children}</>;
};
