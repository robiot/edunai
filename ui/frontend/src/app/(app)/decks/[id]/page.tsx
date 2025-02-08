"use client";

import { useChat } from "ai/react";
import { WalletCards } from "lucide-react";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chat } from "@/components/ui/chat";
import { SelectSeparator } from "@/components/ui/select";

const DeckPage = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat();

  return (
    <div className="flex flex-1 h-full flex-col md:flex-row">
      <Card className="bg-[#F3F6FA] rounded-none w-full md:max-w-72 flex-1 flex items-end justify-center flex-col">
        <div className="p-4 flex w-full">
          <Button className="w-full flex gap-2">
            <WalletCards size={24} />
            Add card to deck
          </Button>
        </div>
        <div className="flex h-[calc(100vh-9rem)]">
          <Chat
            messages={messages}
            input={input}
            className="py-5 px-4"
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isGenerating={isLoading}
            stop={stop}
          />
        </div>
      </Card>
      <Container className="h-[unset] flex-1 rounded-none flex justify-center">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="text-4xl">我已经知道了</span>
            <SelectSeparator className="h-1 w-full" />

            <span className="text-xl">
              Wǒ yǐjīng zhīdàole = I already know that
            </span>
          </div>

          <div className="flex flex-1 gap-2 items-end justify-center py-6">
            <Button
              className="bg-red-600 border-4 border-red-700 hover:bg-red-700 text-white/80 hover:text-white/60"
              size="sm"
            >
              1. Again
            </Button>
            <Button size="sm">2. Good</Button>
            <Button size="sm">3. Hard</Button>
            <Button size="sm">4. Easy</Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DeckPage;
