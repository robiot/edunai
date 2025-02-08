import { useMutation } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { FC, useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckoutABI } from "@/lib/contract_abi";
import { enviroment } from "@/lib/enviroment";

export const DeleteButton: FC<{ id: string }> = ({ id }) => {
  const productContractWrite = useWriteContract();

  const waitForWrite = useWaitForTransactionReceipt({
    hash: productContractWrite.data,
  });

  useEffect(() => {
    if (waitForWrite.isSuccess) {
      window.location.reload();
    }
  }, [waitForWrite.isSuccess]);

  const deleteProduct = useMutation({
    mutationKey: ["delete_product"],
    mutationFn: async () => {
      // For
      const response = await fetch(`${enviroment.BACKEND_URL}/product/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        alert("Error");

        return;
      }

      productContractWrite.writeContract({
        address: enviroment.CONTRACT_ADDRESS, //hardcoded
        abi: CheckoutABI,
        functionName: "removeProduct",
        args: ["0x" + id.replaceAll(/-/g, "")],
      });
    },
  });

  const isLoading =
    deleteProduct.isPending ||
    productContractWrite.isPending ||
    (productContractWrite.isSuccess && waitForWrite.isPending);

  return (
    <Button
      variant="destructive"
      onClick={() => {
        deleteProduct.mutate();
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <Spinner size="sm" className="text-background" />
      ) : (
        <>
          <Trash className="w-4 h-4 mr-4" />
        </>
      )}
      Delete
    </Button>
  );
};
