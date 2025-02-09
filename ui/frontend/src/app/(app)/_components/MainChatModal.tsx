import { FC } from "react";

import { AiChat } from "@/components/ui/ai-chat";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

export const MainChatModal: FC<{
  defaultPrompt: string;
}> = ({ defaultPrompt }) => {
  return (
    <>
      {/* Chat Modal */}
      <div className="flex h-[50vh]">
        <AiChat defaultPrompt={defaultPrompt} />
      </div>
      <DialogFooter className="px-4">
        <DialogClose asChild>
          <Button variant="secondary" className="px-8">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};
