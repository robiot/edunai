"use client";

import { useWeb3ModalTheme } from "@web3modal/wagmi/react";
import { useEffect } from "react";

const LoginPage = () => {
  const { setThemeMode } = useWeb3ModalTheme();

  useEffect(() => {
    setThemeMode("light");
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-7">
      <h1 className="text-2xl">Web3 Checkout</h1>
      <w3m-button />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-foreground/80">
        Created for ETHGlobal Brussels 2024
      </div>
    </div>
  );
};

export default LoginPage;
