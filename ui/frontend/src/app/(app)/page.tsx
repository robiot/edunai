"use client";

import { Sparkles } from "lucide-react";

import { Container } from "@/components/common/Container";
import { Input } from "@/components/ui/input";

import { DecksTable } from "./_components/DecksTable";

const DecksPage = () => {
  return (
    <div className="pb-24">
      <div className="bg-[#F3F6FA] py-24">
        <Container className="text-center flex flex-col gap-3" size="small">
          <h1 className="text-5xl font-bold">Hello Elliot</h1>
          <h2 className="text-xl">What can I help you with</h2>
          <div className="relative mt-7">
            <Input placeholder="Ex. create deck, add card. What should I study." />

            <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/50" />
          </div>
        </Container>
      </div>
      <Container className="mt-10">
        <DecksTable />
      </Container>
    </div>
  );
};

export default DecksPage;
