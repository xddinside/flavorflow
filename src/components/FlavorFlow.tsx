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
import { saveChatHistory, loadChatHistory, saveRecipes, loadRecipes } from '@/lib/chat-history';

export default function FlavorFlow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [assistantTextMessage, setAssistantTextMessage] = useState<string | null>(null);

  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setMessages(history);
    }
    const cachedRecipes = loadRecipes();
    if (cachedRecipes.length > 0) {
      setRecipes(cachedRecipes);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (recipes.length > 0) {
      saveRecipes(recipes);
    }
  }, [recipes]);

const sendChatMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
    setSelectedRecipe(null);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
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

    setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });
      assistantResponse += chunk;
    }
    
    const finalResponse = assistantResponse.trim();

    if (finalResponse.startsWith('text')) {
      const textContent = finalResponse.substring(4).trim();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: textContent } : msg
        )
      );
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
        setRecipes(fetchedRecipes);
        setAssistantTextMessage(null);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: `Found ${fetchedRecipes.length} recipe(s).` } : msg
          )
        );
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        setAssistantTextMessage("Sorry, I received recipe data in a format I couldn't understand. Please try again.");
        setRecipes([]); // Clear recipes on JSON parse error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: "Error: Invalid JSON format." } : msg
          )
        );
      }
    } else {
      setAssistantTextMessage(finalResponse || "Sorry, I couldn't generate a response. Please try again.");
      setRecipes([]); // Clear recipes for unknown response types
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: finalResponse } : msg
        )
      );
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
    <div className="flex h-[calc(100vh-10rem)] w-full bg-background">
      {/* Left side */}
      <div className="flex flex-col w-1/2 h-full p-4 border-r border-border">
        <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Your <span className='text-amber-500'>Flow</span></h2>
        <div className="flex-grow overflow-y-auto pr-2">
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

      {/* Right side */}
      <div className="flex flex-col w-1/2 h-full p-4">
        <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Our <span className="underline decoration-amber-500">Flavors</span></h2>
        <div className="flex-grow overflow-y-auto pr-2">
          {/* MODIFIED: Conditional rendering logic */}
          {selectedRecipe ? (
            <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} onClick={setSelectedRecipe} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Sparkles className="w-16 h-16 mb-4 text-primary" />
              <p className="text-lg">Start typing on the left to get started.</p>
              <p className="text-sm">Or try some ideas on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
