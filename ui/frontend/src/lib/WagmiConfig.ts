import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";

// Your WalletConnect Cloud project ID
export const projectId = "1efd51f60e90da76d72960d820cd5d4a";

// Create a metadata object
const metadata = {
  name: "Web3 Checkout",
  description: "AppKit Example",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create wagmiConfig
const chains = [
  // mainnet,
  sepolia,
] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  //   ...wagmiOptions // Optional - Override createConfig parameters
});
