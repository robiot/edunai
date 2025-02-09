"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { DecksTable } from "./_components/DecksTable";
import { MainChatModal } from "./_components/MainChatModal";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

type FormData = z.infer<typeof schema>;

const DecksPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });


  const [userName, setUserName] = useState<string>("");

  // Get user data on component mount
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      setUserName(
        session.user.user_metadata.name.split(" ")[0] || "User",
      );
    }
  });

  const [initValue, setInitValue] = useState<string | null>(null);


  return (
    <div className="pb-24">
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#F3F6FA]">
          <DialogTitle className="text-2xl font-bold hidden">Chat</DialogTitle>
          {modalOpen && <MainChatModal defaultPrompt={initValue ?? ""} />}
        </DialogContent>
      </Dialog>
      <div className="bg-[#F3F6FA] py-24">
        <Container className="text-center flex flex-col gap-3" size="small">
          <h1 className="text-5xl font-bold">Hello {userName ?? "..."}</h1>
          <h2 className="text-xl">What can I help you with</h2>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              setModalOpen(true);

              setInitValue(data.prompt);

              form.reset();

              // this fucking shit is not working, im not spending more time on this at 2am

              // await new Promise((resolve) => setTimeout(resolve, 1000));
              // console.log("submitting rn");
              // chat.handleSubmit(); // Ensure state has updated before submitting
            })}
            className="flex gap-2 mt-7 items-center"
          >
            <div className="relative  w-full">
              <Input
                placeholder="Ex. create deck, add card. What should I study."
                {...form.register("prompt")}
              />

              <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/50" />
            </div>
            <Button type="submit" className="px-4 h-14 w-14 border">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Container>
      </div>
      <Container className="mt-10 ">
        <DecksTable />
      </Container>
    </div>
  );
};

export default DecksPage;
