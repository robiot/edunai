import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import EmojiPicker from "emoji-picker-react";
import React, { FC, ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDecks } from "@/hooks/useDecks";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().min(1, "Emoji is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const CreateDeckModal: FC<{ children: ReactNode }> = ({ children }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dialogCloseReference = React.createRef<HTMLButtonElement>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const decks = useDecks();

  const mutation = useMutation({
    mutationKey: ["createDeck"],
    mutationFn: async (data: FormData) => {
      return api.post("/fsrs", {
        action: "create_deck",
        deck_name: data.name,
        description: data.description,
        emoji: data.emoji,
      });
    },
    onSuccess: async () => {
      await decks.refetch();
      dialogCloseReference.current?.click();
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogClose ref={dialogCloseReference} className="hidden" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              className="border-2 h-12 rounded-md"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="name">Description</label>
            <Input
              id="name"
              className="border-2 h-12 rounded-md"
              {...register("description")}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="emoji">Emoji</label>
            <div className="relative">
              <Controller
                name="emoji"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      id="emoji"
                      className="border-2 h-12 rounded-md"
                      value={field.value || ""}
                      onClick={() => setShowEmojiPicker(true)}
                      readOnly
                    />
                    {showEmojiPicker && (
                      <div className="absolute z-10 mt-1">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            field.onChange(emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              />
            </div>
            {errors.emoji && (
              <span className="text-red-500 text-sm">
                {errors.emoji.message}
              </span>
            )}
          </div>
          <Button type="submit" className="w-full mt-4 py-6" variant="filled">
            {mutation.isPending ? "Creating Deck..." : "Create Deck"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
