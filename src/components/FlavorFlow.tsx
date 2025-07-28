'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Recipe, RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';
import { ChatMessages, ChatForm } from '@/components/ui/chat';
import { Message } from '@/components/ui/chat-message';
import { MessageInput } from '@/components/ui/message-input';
import { MessageList } from '@/components/ui/message-list';
import { PromptSuggestions } from '@/components/ui/prompt-suggestions';
import { Sparkles } from 'lucide-react';
import { saveChats, loadChats, saveRecipes, loadRecipes, ChatSession } from '@/lib/chat-history';
import { ChatHistory } from './ChatHistory';
import { useAutoScroll } from '@/hooks/use-auto-scroll';

export default function FlavorFlow() {
  const [chats, setChats] = useState<Record<string, ChatSession>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  const activeChat = activeChatId ? chats[activeChatId] : null;
  const messages = activeChat?.messages || [];
  const recipes = activeChatId ? loadRecipes(activeChatId) : [];

  const lastMessage = messages[messages.length - 1];
  const { containerRef } = useAutoScroll<HTMLDivElement>([messages.length, lastMessage?.content]);

  useEffect(() => {
    const loadedChats = loadChats();
    setChats(loadedChats);
    const sortedChats = Object.values(loadedChats).sort((a, b) => b.createdAt - a.createdAt);
    if (sortedChats.length > 0) {
      setActiveChatId(sortedChats[0].id);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(chats).length > 0) {
      saveChats(chats);
    }
  }, [chats]);

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setChats(prev => ({ [newChatId]: newChat, ...prev }));
    setActiveChatId(newChatId);
  };

  const deleteChat = (chatId: string) => {
    const newChats = { ...chats };
    delete newChats[chatId];
    setChats(newChats);
    if (activeChatId === chatId) {
      const remainingChatIds = Object.keys(newChats);
      setActiveChatId(remainingChatIds.length > 0 ? remainingChatIds[0] : null);
    }
  };

  const sendChatMessage = async (content: string) => {
    if (!content.trim()) return;

    let targetChatId = activeChatId;
    let messagesForChat = messages;

    if (!targetChatId) {
      const newChatId = Date.now().toString();
      const newChat: ChatSession = {
        id: newChatId,
        title: content.substring(0, 30),
        messages: [],
        createdAt: Date.now(),
      };
      setChats(prev => ({ [newChatId]: newChat, ...prev }));
      setActiveChatId(newChatId);
      targetChatId = newChatId;
      messagesForChat = [];
    } else if (messagesForChat.length === 0) {
      setChats(prev => ({
        ...prev,
        [targetChatId!]: { ...prev[targetChatId!], title: content.substring(0, 30) }
      }));
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: content };
    const updatedMessages = [...messagesForChat, userMessage];

    setChats(prev => ({
      ...prev,
      [targetChatId!]: {
        ...prev[targetChatId!],
        messages: updatedMessages,
      }
    }));

    setInput('');
    setIsGenerating(true);
    setSelectedRecipe(null);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    if (!res.body) {
      setIsGenerating(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let assistantResponse = '';
    const assistantMessageId = (Date.now() + 1).toString();

    const messagesWithPlaceholder = [...updatedMessages, { id: assistantMessageId, role: 'assistant', content: '' }];
    setChats(prev => ({
      ...prev,
      [targetChatId!]: { ...prev[targetChatId!], messages: messagesWithPlaceholder }
    }));


    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });
      assistantResponse += chunk;
    }

    const finalResponse = assistantResponse.trim();

    console.log(finalResponse)

    const updateAssistantMessage = (content: string) => {
      const finalMessages = messagesWithPlaceholder.map(msg =>
        msg.id === assistantMessageId ? { ...msg, content } : msg
      );
      setChats(prev => ({
        ...prev,
        [targetChatId!]: { ...prev[targetChatId!], messages: finalMessages }
      }));
    }

    // Helper function to process and save recipes
    const processAndSaveRecipes = async (jsonString: string, chatId: string): Promise<number> => {
      let cleanJsonString = jsonString.trim();
      if (cleanJsonString.startsWith('```json')) {
        cleanJsonString = cleanJsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      }
      const jsonResponse = JSON.parse(cleanJsonString);
      const fetchedRecipes: Recipe[] = [];
      const recipesData = Array.isArray(jsonResponse) ? jsonResponse : [jsonResponse];

      for (const recipeData of recipesData) {
        const recipeName = recipeData.recipeName || "Untitled Recipe";
        const description = recipeData.description || "";
        let imageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipeName)}`;

        if (description) {
          try {
            const imageRes = await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description }),
            });
            const data = await imageRes.json();
            if (data.imageUrl) {
              imageUrl = data.imageUrl;
            }
          } catch (error) {
            console.error("Error generating image:", error);
          }
        }

        fetchedRecipes.push({
          recipeName,
          description,
          imageUrl,
          ingredients: recipeData.ingredients || [],
          steps: recipeData.steps || [],
        });
      }
      if (chatId) {
        saveRecipes(chatId, fetchedRecipes);
      }
      return fetchedRecipes.length;
    };


    if (finalResponse.includes('|||')) {
      const [textPart, jsonPart] = finalResponse.split('|||');
      let messageContent = textPart.trim();
      try {
        await processAndSaveRecipes(jsonPart, targetChatId!);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        messageContent += "\n\nError: I received a recipe in an invalid format.";
      }
      updateAssistantMessage(messageContent);
    } else if (finalResponse.trim().startsWith('```json')) {
      try {
        const recipeCount = await processAndSaveRecipes(finalResponse, targetChatId!);
        const message = `I've found ${recipeCount} recipe${recipeCount !== 1 ? 's' : ''} for your request.`;
        updateAssistantMessage(message);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        updateAssistantMessage("Error: I received a recipe in an invalid format.");
      }
    } else {
      updateAssistantMessage(finalResponse || "Sorry, I couldn't generate a response. Please try again.");
    }

    setIsGenerating(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    sendChatMessage(input);
  };

  const suggestions = [
    "I have chicken, rice, and vegetables. What can I make for dinner?",
    "I'm craving comfort food. I have potatoes, cheese, and bacon.",
    "What's a simple Thai recipe I can make at home?",
  ];

  const append = (message: { role: "user"; content: string }) => {
    sendChatMessage(message.content);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full bg-background relative">
      <ChatHistory
        chats={Object.values(chats).sort((a,b) => b.createdAt - a.createdAt)}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isPinned={isSidebarPinned}
        onTogglePin={() => setIsSidebarPinned(!isSidebarPinned)}
      />

      <motion.div
        className="flex-1 flex"
        animate={{ marginLeft: isSidebarPinned ? '16rem' : '4rem' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        <div className="flex flex-col h-full w-1/2 p-4 border-r border-border dark:hover:bg-card/20">
            <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Your <span className='text-amber-500'>Flow</span></h2>
            <div className="flex-grow overflow-y-auto p-4" ref={containerRef}>
            {messages.length === 0 ? (
                <PromptSuggestions
                label="Try these ideas ✨"
                append={append}
                suggestions={suggestions}
                />
            ) : (
                <ChatMessages messages={messages}>
                    <MessageList messages={messages} isTyping={isGenerating}/>
                </ChatMessages>
                )}
            </div>
            <div className="flex-shrink-0 mt-4">
            <ChatForm handleSubmit={handleSubmit} isPending={isGenerating}>
                {({ files, setFiles }) => (
                <MessageInput
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    isGenerating={isGenerating}
                />
                )}
            </ChatForm>
            </div>
        </div>

        <div className="flex flex-col h-full w-1/2 p-4 dark:hover:bg-card/20">
            <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Our <span className="underline decoration-amber-500">Flavors</span></h2>
            <div className="flex-grow overflow-y-auto p-4">
            {selectedRecipe ? (
                <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
            ) : recipes.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {recipes.map((recipe, index) => (
                    <RecipeCard key={index} recipe={recipe} onClick={setSelectedRecipe} />
                    ))}
                </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Sparkles className="w-16 h-16 mb-4 text-primary" />
                    <p className="text-lg">Start typing to get started.</p>
                    <p className="text-sm">Or try some ideas.</p>
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}
