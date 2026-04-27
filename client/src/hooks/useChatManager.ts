import { useState, useCallback, useEffect, useRef } from "react";
import {
  apiGetConversations,
  apiCreateConversation,
  apiDeleteConversation,
  apiGetMessages,
  type Conversation,
  type Message,
} from "@/lib/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

const STORAGE_KEY = "chat_state";

function saveToStorage(chats: Chat[], activeChatId: number | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeChatId }));
  } catch {}
}

function loadFromStorage(): { chats: Chat[]; activeChatId: number | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { chats: [], activeChatId: null };
    return JSON.parse(raw);
  } catch {
    return { chats: [], activeChatId: null };
  }
}

export function clearChatStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function toRole(role: string): "user" | "assistant" {
  const normalized = String(role).trim().toLowerCase();
  if (normalized === "assistant" || normalized === "ai" || normalized === "bot") {
    return "assistant";
  }
  return "user";
}

export function useChatManager() {
  const cached = loadFromStorage();
  const [chats, setChats] = useState<Chat[]>(cached.chats);
  const [activeChatId, setActiveChatId] = useState<number | null>(cached.activeChatId);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const loadedPromiseRef = useRef<{ resolve: () => void } | null>(null);
  const loadedPromise = useRef<Promise<void>>(
    new Promise((res) => {
      loadedPromiseRef.current = { resolve: res };
    })
  );

  function persist(nextChats: Chat[], nextActiveId: number | null) {
    saveToStorage(nextChats, nextActiveId);
  }

  const loadConversations = useCallback(async () => {
    try {
      const conversations: Conversation[] = await apiGetConversations();
      
      const formattedChats = conversations.map((c) => ({
        id: c.id,
        title: c.title || "New Chat",
        messages: [],
        createdAt: c.created_at,
      }));

      setChats(formattedChats);

      if (formattedChats.length > 0 && !activeChatId) {
        const firstId = formattedChats[0].id;
        setActiveChatId(firstId);
        saveToStorage(formattedChats, firstId);
      } else if (formattedChats.length === 0) {
        setActiveChatId(null);
        saveToStorage([], null);
      }
    } catch (error) {
      console.error("Failed to load chats", error);
    } finally {
      setIsLoadingChats(false);
      loadedPromiseRef.current?.resolve();
    }
  }, [activeChatId]);

  useEffect(() => {
    loadConversations();
  }, []); // ← مهم: فقط مرة واحدة عند الـ mount

  const waitForLoad = useCallback(() => loadedPromise.current, []);

  const activeChatIdRef = useRef(activeChatId);
  const chatsRef = useRef(chats);
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  useEffect(() => { chatsRef.current = chats; }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  // ====================== loadMessages (محسن) ======================
  const loadMessages = useCallback(async (chatId: number) => {
    if (!chatId) return;

    try {
      const messages: Message[] = await apiGetMessages(chatId);

      setChats((prev) => {
        const existingChat = prev.find((c) => c.id === chatId);
        const existingMessages = existingChat?.messages ?? [];
        const existingAssistantMessages = existingMessages.filter(
          (msg) => msg.role === "assistant"
        );

        const restoredMessages: ChatMessage[] = messages.map((m) => ({
          role: toRole(m.role),
          // Backend may store real user code in `code_content` while `content`
          // contains a generic prompt; prefer code_content for restored user messages.
          content:
            m.role === "user" && m.code_content?.trim()
              ? m.code_content
              : m.content,
        }));

        const restoredHasAssistant = restoredMessages.some(
          (msg) => msg.role === "assistant"
        );

        // If backend returns user-only history, keep previously cached assistant messages
        // so chat restoration does not drop existing AI responses.
        const mergedMessages =
          !restoredHasAssistant && existingAssistantMessages.length > 0
            ? [...restoredMessages, ...existingAssistantMessages]
            : restoredMessages;

        const next = prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: mergedMessages,
              }
            : c
        );
        persist(next, activeChatIdRef.current ?? chatId);
        return next;
      });
    } catch (error) {
      console.error("Failed to load messages for chat", chatId, error);
    }
  }, []);

  // ====================== setActiveChat (محسن) ======================
  const setActiveChat = useCallback(async (chatId: number) => {
    if (!chatId) return;

    setActiveChatId(chatId);

    // تحديث localStorage
    setChats((prev) => {
      persist(prev, chatId);
      return prev;
    });

    // حمل الرسائل مرة واحدة فقط
    await loadMessages(chatId);
  }, [loadMessages]);

  const createNewChat = useCallback(async (): Promise<number> => {
    const conversation = await apiCreateConversation("New Chat");
    const newChat: Chat = {
      id: conversation.id,
      title: conversation.title || "New Chat",
      messages: [],
      createdAt: conversation.created_at,
    };

    setChats((prev) => {
      const next = [newChat, ...prev];
      persist(next, newChat.id);
      return next;
    });

    setActiveChatId(newChat.id);
    // حمل الرسائل للشات الجديد (عادة بيكون فاضي)
    await loadMessages(newChat.id);

    return newChat.id;
  }, [loadMessages]);

  const getOrAssignChatId = useCallback(async (): Promise<number> => {
    await waitForLoad();
    const freshActiveId = activeChatIdRef.current;
    if (freshActiveId != null) return freshActiveId;

    const freshChats = chatsRef.current;
    if (freshChats.length > 0) {
      const id = freshChats[0].id;
      setActiveChatId(id);
      persist(freshChats, id);
      return id;
    }
    return createNewChat();
  }, [waitForLoad, createNewChat]);

  const addMessageToChat = useCallback((chatId: number, message: ChatMessage) => {
    setChats((prev) => {
      const next = prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        const updatedMessages = [...chat.messages, message];
        const title =
          chat.messages.length === 0 && message.role === "user"
            ? message.content.trim().slice(0, 37) +
              (message.content.trim().length > 37 ? "..." : "")
            : chat.title;
        return { ...chat, messages: updatedMessages, title };
      });
      persist(next, chatId);
      return next;
    });
  }, []);

  const deleteChat = useCallback(
    async (chatId: number) => {
      try {
        await apiDeleteConversation(chatId);
      } catch {}
      
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== chatId);
        const nextActive = activeChatId === chatId
          ? (filtered.length > 0 ? filtered[0].id : null)
          : activeChatId;
        
        setActiveChatId(nextActive);
        persist(filtered, nextActive);
        return filtered;
      });
    },
    [activeChatId]
  );

  // Always refresh active chat messages from server on chat switch.
  // This prevents stale localStorage state from hiding restored assistant replies.
  useEffect(() => {
    if (!activeChatId) return;
    loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  return {
    chats,
    activeChatId,
    activeChat,
    isLoadingChats,
    createNewChat,
    setActiveChat,
    addMessageToChat,
    deleteChat,
    refreshChats: loadConversations,
    getOrAssignChatId,
  };
}