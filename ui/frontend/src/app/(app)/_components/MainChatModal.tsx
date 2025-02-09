import { useChat } from "ai/react";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import { Chat } from "@/components/ui/chat";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

export const MainChatModal: FC<{
  chat: ReturnType<typeof useChat>;
}> = ({ chat }) => {
  return (
    <>
      {/* Chat Modal */}
      <div className="flex h-[50vh]">
        <Chat
          messages={chat.messages as any}
          input={chat.input}
          className="py-5 px-4"
          handleInputChange={chat.handleInputChange}
          handleSubmit={chat.handleSubmit}
          isGenerating={chat.isLoading}
          //   append={chat.append}
          stop={stop}
        />
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
