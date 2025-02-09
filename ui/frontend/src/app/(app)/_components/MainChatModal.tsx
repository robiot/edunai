import { FC } from "react";

import { AiChat } from "@/components/ui/ai-chat";

export const MainChatModal: FC<{
  defaultPrompt: string;
}> = ({ defaultPrompt }) => {
  return (
    <>
      {/* Chat Modal */}
      <div className="flex flex-col h-[50vh] mb-4">
        <AiChat defaultPrompt={defaultPrompt} />
      </div>
    </>
  );
};
