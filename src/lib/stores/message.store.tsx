import { create } from "zustand";
import { Message } from "@/types/message.types";
import { persist } from "zustand/middleware";

type MessageStoreState = {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
}

export const useMessageStore = create<MessageStoreState>()(
    persist(
        (set) => ({
            messages: [],
            setMessages: (messages: Message[]) => set({ messages }),
        }),
        {
            name: "message-storage",
        }
    )
);