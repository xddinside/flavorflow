'use client';
import React, { useState, useEffect } from 'react';
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

export default function FlavorFlow() {
  const [chats, setChats] = useState<Record<string, ChatSession>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const activeChat = activeChatId ? chats[activeChatId] : null;
  const messages = activeChat?.messages || [];
  const recipes = activeChatId ? loadRecipes(activeChatId) : [];

  useEffect(() => {
    const loadedChats = loadChats();
    setChats(loadedChats);
    if (Object.keys(loadedChats).length > 0) {
      setActiveChatId(Object.keys(loadedChats)[0]);
    } else {
      createNewChat();
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
    setChats(prev => ({ ...prev, [newChatId]: newChat }));
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

  const updateMessages = (newMessages: Message[]) => {
    if (activeChatId) {
      setChats(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: newMessages,
        }
      }))
    }
  }

  const sendChatMessage = async (content: string) => {
    if (!content.trim() || !activeChatId) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: content };
    const updatedMessages = [...messages, userMessage];
    updateMessages(updatedMessages);

    setInput('');
    setIsGenerating(true);
    setSelectedRecipe(null);

    if (messages.length === 0) {
      setChats(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          title: content.substring(0, 30),
        }
      }))
    }

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

    const currentMessages = [...updatedMessages, { id: assistantMessageId, role: 'assistant', content: '' }];
    updateMessages(currentMessages);


    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });
      assistantResponse += chunk;
    }

    const finalResponse = assistantResponse.trim();

    const updateAssistantMessage = (content: string) => {
      const finalMessages = currentMessages.map(msg =>
        msg.id === assistantMessageId ? { ...msg, content } : msg
      );
      updateMessages(finalMessages);
    }


    if (finalResponse.startsWith('text')) {
      const textContent = finalResponse.substring(4).trim();
      updateAssistantMessage(textContent);
    } else if (finalResponse.startsWith('json') || finalResponse.startsWith('```json')) {
      let jsonString = '';
      if (finalResponse.startsWith('```json')) {
        jsonString = finalResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      } else {
        jsonString = finalResponse.substring(4).trim();
      }

      try {
        const jsonResponse = JSON.parse(jsonString);
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
        if (activeChatId) {
          saveRecipes(activeChatId, fetchedRecipes);
        }
        updateAssistantMessage(`Found ${fetchedRecipes.length} recipe(s).`);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        updateAssistantMessage("Error: Invalid JSON format.");
      }
    } else {
      updateAssistantMessage(finalResponse || "Sorry, I couldn't generate a response. Please try again.");
    }

    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(input);
  };

  const suggestions = [
    "I have chicken, rice, and vegetables. What can I make for dinner?",
    "I'm craving comfort food. I have potatoes, cheese, and bacon.",
    "Suggest a healthy lunch using salmon, sweet potato, and greens.",
    "What's a simple Thai recipe I can make at home?",
  ];

  const append = (message: { role: "user"; content: string }) => {
    sendChatMessage(message.content);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full bg-background">
      <div className="w-1/4 h-full">
        <ChatHistory
          chats={Object.values(chats).sort((a,b) => b.createdAt - a.createdAt)}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
        />
      </div>

      <div className="flex flex-col w-1/2 h-full p-4 border-r border-border">
        <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Your <span className='text-amber-500'>Flow</span></h2>
        <div className="flex-grow overflow-y-auto p-4">
          {messages.length === 0 ? (
            <PromptSuggestions
              label="Try these ideas ✨"
              append={append}
              suggestions={suggestions}
            />
          ) : (
              <ChatMessages messages={messages}>
                <MessageList messages={messages} align="left"/>
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

      <div className="flex flex-col w-1/4 h-full p-4">
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
    </div>
  );
}
