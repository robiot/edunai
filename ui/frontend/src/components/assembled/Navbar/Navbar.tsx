import Image from "next/image";
import { FC } from "react";

import { Container } from "@/components/common/Container";

export const Navbar: FC = () => {
  return (
    <div className="w-full sticky inset-0 border-b-border border-b h-16">
      <Container className="w-full flex h-full justify-between items-center">
        <div>
          <Image
            src="/logo.svg"
            alt="logo"
            height={120}
            width={450}
            className="h-4 w-fit"
          />
        </div>
        <w3m-button balance="hide" />
      </Container>
    </div>
  );
};
