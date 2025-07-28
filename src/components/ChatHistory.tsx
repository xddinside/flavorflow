import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSession } from '@/lib/chat-history';
import { LogIn, UserPlus, Menu, Plus, MessageSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

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
      className={cn(
        "absolute z-10 flex flex-col h-full p-2 border-r border-border",
        isOpen && !isPinned ? "bg-background/70 dark:bg-background/80 backdrop-blur-sm" : "bg-background"
      )}
    >
      {/* Header */}
      <div className="relative flex items-center justify-center h-10 mb-2 group">
        <button
          onClick={onTogglePin}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-neutral-200/50 dark:hover:bg-stone-800"
        >
          <Menu size={20} />
        </button>
        <div className="absolute top-full mt-2 hidden group-hover:block bg-background/80 backdrop-blur-xs text-primary text-xs rounded py-2 px-2">
          {isPinned ? 'Collapse menu' : isExpanded ? 'Keep menu expanded' : 'Expand menu'}
        </div>
        <AnimatePresence>
            {isExpanded && (
                <motion.span
                    key="history-title"
                    variants={textVariant}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{duration: 0.2}}
                    className="text-xl font-semibold"
                >
                    Flows
                </motion.span>
            )}
        </AnimatePresence>
      </div>

      {/* Hoverable Body Section */}
      <div
        className="flex flex-col flex-grow"
        onMouseEnter={() => !isPinned && setIsOpen(true)}
        onMouseLeave={() => !isPinned && setIsOpen(false)}
      >
        <Button
          onClick={onNewChat}
          className="mb-4 mt-4 justify-start p-2 dark:bg-primary dark:hover:bg-primary/85"
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
                      className="ml-7"
                  >
                      Create New Chat
                  </motion.span>
              )}
          </AnimatePresence>
        </Button>

        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-2 rounded-lg cursor-pointer my-1 ${
                chat.id === activeChatId ? 'bg-neutral-200/50 dark:bg-stone-800' : 'hover:bg-neutral-200/50  dark:hover:bg-stone-800/50'
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
                          className="ml-2 text-black/70 hover:text-black dark:text-white"
                      >
                          <X size={16}/>
                      </motion.button>
                  )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        {/* Auth Buttons for Mobile */}
        <div className="mt-auto pt-4 border-t border-border md:hidden">
            <AnimatePresence>
                {isExpanded && (
                <motion.div
                    key="auth-buttons"
                    variants={textVariant}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-2"
                >
                    <Button className="w-full justify-start p-2">
                        <LogIn size={20} className="shrink-0" />
                        <span className="ml-17">Login</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start p-2">
                        <UserPlus size={20} className="shrink-0" />
                        <span className="ml-15">Sign Up</span>
                    </Button>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
