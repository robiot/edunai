import { createContext, useContext } from "react";

interface ChatCollapseContextType {
  isCollapsed: boolean;
}

export const ChatCollapseContext = createContext<ChatCollapseContextType>({
  isCollapsed: false,
});

export const useChatCollapse = () => useContext(ChatCollapseContext);
