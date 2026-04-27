import { useState } from "react";
import { MessageSquarePlus, Trash2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Chat } from "@/hooks/useChatManager";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: number | null;
  onNewChat: () => void;
  onSelectChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }

  return (
    <aside
      className={`relative flex flex-col bg-[#f3f4f6] border-r border-gray-200 transition-all duration-300 shrink-0 ${
        collapsed ? "w-[56px]" : "w-[260px]"
      }`}
      style={{ minHeight: 0 }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* New Chat button */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 bg-gradient-to-r from-[#002a63] to-[#df33a8] text-white font-semibold rounded-[10px] px-3 py-2.5 hover:opacity-90 transition-opacity text-sm ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title="New Chat"
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto py-2">
        {!collapsed && chats.length === 0 && (
          <p className="text-gray-400 text-xs text-center mt-6 px-4">
            No chats yet. Start a new chat!
          </p>
        )}

        {chats.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <div
              key={chat.id}
              className={`group relative flex items-center gap-2 mx-2 my-0.5 rounded-[8px] cursor-pointer transition-colors ${
                isActive
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              {collapsed ? (
                <div className="w-full flex justify-center py-2.5">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-[#df33a8]" : "text-gray-400"}`}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full px-3 py-2.5 pr-8 min-w-0">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-[#df33a8]" : "text-white/40"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(chat.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {!collapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-500 text-gray-400 transition-all"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer label */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-gray-200">
          <p className="text-gray-400 text-xs text-center">Chat History</p>
        </div>
      )}
    </aside>
  );
}
