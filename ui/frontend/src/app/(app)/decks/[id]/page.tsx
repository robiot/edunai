"use client";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectSeparator } from "@/components/ui/select";

const DeckPage = () => {
  return (
    <div className="flex flex-1 h-full flex-col md:flex-row">
      <Card className="bg-[#F3F6FA] py-5 px-4 w-full md:max-w-80  flex-1 rounded-none flex items-end">
        <Input
          type="text"
          className="h-12"
          placeholder="Ex. add card, or cards about a topic."
        />
      </Card>

      <Container>
        <div className="flex flex-col items-center gap-3 py-16">
          <span className="text-4xl">我已经知道了</span>
          <SelectSeparator className="h-1 w-full" />

          <span className="text-xl">
            Wǒ yǐjīng zhīdàole = I already know that
          </span>
        </div>

        <div className="flex gap-2">
          <Button className="bg-red-600 border-4 border-red-700 hover:bg-red-700">
            1. Again
          </Button>
          <Button>2. Good</Button>
          <Button>3. Hard</Button>
          <Button>4. Easy</Button>
        </div>
      </Container>
    </div>
  );
};

export default DeckPage;
