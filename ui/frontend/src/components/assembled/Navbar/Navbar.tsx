import { ChevronDown } from "lucide-react";
import { FC } from "react";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";

export const Navbar: FC = () => {
  return (
    <div className="w-full sticky inset-0 border-b-border border-b h-16">
      <Container
        className="w-full flex h-full justify-between items-center"
        size="large"
      >
        <h1 className="text-2xl text-[#605BFB] font-bold">Edunai</h1>

        <Button variant="ghost" className="text-foreground/80 gap-4">
          <span>Elliot Lindberg</span>
          <ChevronDown />
        </Button>
      </Container>
    </div>
  );
};
