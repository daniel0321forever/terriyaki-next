import { create } from "zustand";
import { Message } from "@/types/message.types";
import { persist } from "zustand/middleware";

export const useMessageStore = create(
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