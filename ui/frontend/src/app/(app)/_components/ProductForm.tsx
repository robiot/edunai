/* eslint-disable unicorn/no-await-expression-member */
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React, { FC, ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useWriteContract } from "wagmi";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { CheckoutABI } from "@/lib/contract_abi";
import { enviroment } from "@/lib/enviroment";
import { hashObject } from "@/lib/utils";

// Define Zod schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be a positive number"),
  media: z.string().url().optional(),
  // requireRealHuman: z.boolean(),
  purchaseLimitPerHuman: z.number().int(),
});

// Define form data type based on the schema
type FormData = z.infer<typeof formSchema>;

export const Label: FC<{ children: ReactNode }> = ({ children }) => {
  return <p className="text-foreground/80 mb-2 mt-8 text-sm">{children}</p>;
};

export const Ero: FC<{ children: ReactNode }> = ({ children }) => {
  return <p className="text-red-600 my-2 text-sm">{children}</p>;
};

export const ProductForm: FC<{
  kind: "create" | "modify";
  defaultValues?: Partial<FormData>;
}> = ({ kind, defaultValues }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const account = useAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // ABI

  const productContractWrite = useWriteContract();

  const waitForWrite = useWaitForTransactionReceipt({
    hash: productContractWrite.data,
  });

  useEffect(() => {
    if (waitForWrite.isSuccess) {
      window.location.reload();
    }
  }, [waitForWrite.isSuccess]);

  const createProduct = useMutation({
    mutationKey: ["create_product"],
    mutationFn: async (data: FormData) => {
      console.log("hello???");
      // For
      const _price = Math.ceil(Number(data.price) * 100);
      const response = await fetch(`${enviroment.BACKEND_URL}/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          created_by: account.address as string,
          name: data.name,
          description: data.description,
          media: [data.media],
          price: _price,
          requireWorldCoin: Number(data.purchaseLimitPerHuman) > 0,
          limitPerHuman: data.purchaseLimitPerHuman,
        }),
      });

      if (response.status !== 200) {
        alert("Error");

        return;
      }

      const jsonData = (await response.json()) as {
        data: { id: string; price: number; limitPerHuman: number }; // there is more
      };

      console.log("writing contracto");
      productContractWrite.writeContract({
        address: enviroment.CONTRACT_ADDRESS, //hardcoded
        abi: CheckoutABI,
        functionName: "addProduct",
        args: [
          "0x" + jsonData.data.id.replaceAll(/-/g, ""),
          "0x" + (await hashObject(jsonData.data)).toString("hex"),
          BigInt(_price) * BigInt(10_000),
          jsonData.data.limitPerHuman,
          account.address,
        ],
      });

      console.log("Here is your id monseiror", jsonData.data.id);
    },
  });

  const modifyProduct = useMutation({
    mutationKey: ["modify_product"],
    mutationFn: async (data: FormData) => {
      // For
      const _price = Math.ceil(Number(data.price) * 100);
      const response = await fetch(
        `${enviroment.BACKEND_URL}/product/${data.id!}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            created_by: account.address as string,
            name: data.name,
            description: data.description,
            media: [data.media],
            price: _price,
            requireWorldCoin: Number(data.purchaseLimitPerHuman) > 0,
            limitPerHuman: data.purchaseLimitPerHuman,
          }),
        },
      );

      if (response.status !== 200) {
        alert("Error");

        return;
      }

      console.log("writing contracto");
      productContractWrite.writeContract({
        address: enviroment.CONTRACT_ADDRESS, //hardcoded
        abi: CheckoutABI,
        functionName: "updateProduct",
        args: [
          "0x" + data.id?.replaceAll(/-/g, ""),
          BigInt(_price) * BigInt(10_000),
          data?.purchaseLimitPerHuman,
          account.address,
          "0x" + (await hashObject(data)).toString("hex"),
        ],
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (kind == "create") {
      createProduct.mutate(data);
    } else if (kind == "modify") {
      modifyProduct.mutate(data);
    }
  };

  const isLoading =
    createProduct.isPending ||
    productContractWrite.isPending ||
    (productContractWrite.isSuccess && waitForWrite.isPending);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (thing) => {
        console.log("invalid", thing);
      })}
    >
      {/* <div>
        <Label>ID</Label>
        <Input {...register("id")} disabled />
      </div> */}

      <div>
        <Label>Name</Label>
        <Input {...register("name")} />
        {errors.name && <Ero>{errors.name.message}</Ero>}
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} />
        {errors.description && <Ero>{errors.description.message}</Ero>}
      </div>

      <div>
        <Label>Price in $USDC</Label>
        <Input {...register("price", { valueAsNumber: true })} />
        {errors.price && <Ero>{errors.price.message}</Ero>}
      </div>

      <div>
        <Label>Media</Label>
        <Input {...register("media")} placeholder="Image url" />
        {errors.name && <Ero>{errors.name.message}</Ero>}
      </div>

      <div>
        <Label>Purchase Limit Per Human (0 for none)</Label>
        <Input
          type="number"
          {...register("purchaseLimitPerHuman", { valueAsNumber: true })}
        />
        {errors.purchaseLimitPerHuman && (
          <Ero>{errors.purchaseLimitPerHuman.message}</Ero>
        )}
      </div>

      <div className="my-8 flex gap-4">
        <Button variant="secondary">Cancel</Button>
        <Button
          className="flex-1 flex gap-4"
          type="submit"
          disabled={isLoading}
        >
          {isLoading && <Spinner size="sm" className="text-background" />}
          Save changes
        </Button>
      </div>
    </form>
  );
};
