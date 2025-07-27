import React from 'react';
import { ChatSession } from '@/lib/chat-history';

interface ChatHistoryProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) => {
  return (
    <div className="flex flex-col h-full p-4 border-r border-border bg-muted/50">
      <button
        onClick={onNewChat}
        className="mb-4 px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90"
      >
        + New Chat
      </button>
      <div className="flex-grow overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex justify-between items-center p-2 rounded-lg cursor-pointer ${
              chat.id === activeChatId ? 'bg-accent' : 'hover:bg-accent/50'
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="truncate">{chat.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
