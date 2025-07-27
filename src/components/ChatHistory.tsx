import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSession } from '@/lib/chat-history';
import { Menu, Plus, MessageSquare, X } from 'lucide-react';

interface ChatHistoryProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

const sidebarVariants = {
  open: { width: '16rem' },
  closed: { width: '4rem' },
};

const textVariant = {
  hidden: { opacity: 0, x: -20, display: 'none' },
  visible: { opacity: 1, x: 0, display: 'inline-block' },
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, isOpen, setIsOpen, isPinned, onTogglePin }) => {
  const isExpanded = isOpen || isPinned;

  return (
    <motion.div
      initial={false}
      animate={isExpanded ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col h-full p-2 border-r border-border bg-muted/50"
      onMouseLeave={() => !isPinned && setIsOpen(false)}
    >
      {/* Header */}
      <div className="relative flex items-center justify-center h-10 mb-2">
        <button
          onClick={onTogglePin}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-accent"
        >
          <Menu size={20} />
        </button>
        <AnimatePresence>
            {isExpanded && (
                <motion.span
                    key="history-title"
                    variants={textVariant}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{duration: 0.2}}
                    className="font-bold"
                >
                    History
                </motion.span>
            )}
        </AnimatePresence>
      </div>

      {/* Hoverable Body Section */}
      <div
        className="flex flex-col flex-grow"
        onMouseEnter={() => !isPinned && setIsOpen(true)}
      >
        <button
          onClick={onNewChat}
          className="mb-4 w-full flex items-center justify-start p-2 text-white bg-primary rounded-lg hover:bg-primary/90"
        >
          <Plus size={20} className="shrink-0" />
          <AnimatePresence>
              {isExpanded && (
                  <motion.span
                      key="new-chat-text"
                      variants={textVariant}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{duration: 0.2}}
                      className="ml-2"
                  >
                      Create New Chat
                  </motion.span>
              )}
          </AnimatePresence>
        </button>

        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-2 rounded-lg cursor-pointer my-1 ${
                chat.id === activeChatId ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare size={20} className="shrink-0"/>
              <AnimatePresence>
                  {isExpanded && (
                      <motion.span
                          key={`chat-title-${chat.id}`}
                          variants={textVariant}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{duration: 0.2}}
                          className="ml-2 truncate flex-grow"
                      >
                          {chat.title}
                      </motion.span>
                  )}
              </AnimatePresence>
              <AnimatePresence>
                  {isExpanded && (
                      <motion.button
                          key={`delete-btn-${chat.id}`}
                          variants={textVariant}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{duration: 0.2}}
                          onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                      >
                          <X size={16}/>
                      </motion.button>
                  )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
