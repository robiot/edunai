import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { FC, ReactNode } from "react";
import { useForm } from "react-hook-form";
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
import { api } from "@/lib/api";

const schema = z.object({
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const CreateCardModal: FC<{
  children: ReactNode;
  onSuccess: () => void;
}> = ({ children, onSuccess }) => {
  const dialogCloseReference = React.createRef<HTMLButtonElement>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const parameters = useParams();
  const deckId = parameters?.id as string;

  const mutation = useMutation({
    mutationKey: ["createFlashcard"],
    mutationFn: async (data: FormData) => {
      if (!deckId) {
        return;
      }

      return api.post("/fsrs", {
        action: "create_flashcard",
        front_content: data.front,
        back_content: data.back,
        deck_id: deckId,
      });
    },
    onSuccess: async () => {
      onSuccess();
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
          <DialogTitle>Create Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="name">Front</label>
            <Input
              id="name"
              className="border-2 h-12 rounded-md"
              {...register("front")}
            />
            {errors.front && (
              <span className="text-red-500 text-sm">
                {errors.front.message}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="name">Back</label>
            <Input
              id="name"
              className="border-2 h-12 rounded-md"
              {...register("back")}
            />
            {errors.back && (
              <span className="text-red-500 text-sm">
                {errors.back.message}
              </span>
            )}
          </div>
          <Button type="submit" className="w-full mt-4 py-6" variant="filled">
            {mutation.isPending ? "Creating Card..." : "Create Card"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
