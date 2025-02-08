import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import EmojiPicker from "emoji-picker-react";
import React, { FC, ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().min(1, "Emoji is required"),
});

type FormData = z.infer<typeof schema>;

export const CreateDeckModal: FC<{ children: ReactNode }> = ({ children }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationKey: ["createDeck"],
    mutationFn: async (data: FormData) => {
      return api.post("/decks", data);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              className="border-2 rounded-md"
              {...register("name")}
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
                      className="border-2 rounded-md"
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
            Create Deck
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
