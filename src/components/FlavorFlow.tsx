'use client';
import React, { useState } from 'react';
import { Recipe, RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';
import { ChatMessages, ChatForm } from '@/components/ui/chat';
import { Message } from '@/components/ui/chat-message';
import { MessageInput } from '@/components/ui/message-input';
import { MessageList } from '@/components/ui/message-list';
import { PromptSuggestions } from '@/components/ui/prompt-suggestions';
import { Sparkles } from 'lucide-react';

export default function FlavorFlow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const sendChatMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage] }), // Send the whole history
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


    try {
      const cleanedResponse = assistantResponse.replace(/^```json\n|\n```$/g, '');
      const jsonResponse = JSON.parse(cleanedResponse);
      const fetchedRecipes: Recipe[] = [];

      if (Array.isArray(jsonResponse)) {
        for (const recipeData of jsonResponse) {
          const recipeName = recipeData.recipeName || "";
          const description = recipeData.description || "";
          const ingredients = recipeData.ingredients || [];
          const steps = recipeData.steps || [];
          let imageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipeName || description)}`;

          // Fetch image for the current recipe
          if (description) {
            try {
              const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ description: description }),
              });
              const data = await response.json();
              if (data.imageUrl) {
                imageUrl = data.imageUrl;
              }
            } catch (error) {
              console.error("Error generating image for recipe:", error);
            }
          }
          fetchedRecipes.push({
            recipeName,
            description,
            imageUrl,
            ingredients,
            steps,
          });
        }
      } else {
        // Fallback for single object if array is not returned
        const recipeName = jsonResponse.recipeName || "";
        const description = jsonResponse.description || "";
        const ingredients = jsonResponse.ingredients || [];
        const steps = jsonResponse.steps || [];
        let imageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipeName || description)}`;

        if (description) {
          try {
            const response = await fetch("/api/generate-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ description: description }),
            });
            const data = await response.json();
            if (data.imageUrl) {
              imageUrl = data.imageUrl;
            }
          } catch (error) {
            console.error("Error generating image for recipe:", error);
          }
        }
        fetchedRecipes.push({
          recipeName,
          description,
          imageUrl,
          ingredients,
          steps,
        });
      }

      setRecipes(fetchedRecipes);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: "" } : msg
        )
      );
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: `Error: Could not parse recipe information. Raw response: ${assistantResponse}` } : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(input);
  };

  const userMessages = messages.filter((msg) => msg.role === 'user');

  const suggestions = [
    "Suggest a recipe using chicken, broccoli, and rice.",
    "I have eggs, cheese, and bread. What can I make for breakfast?",
    "Give me a recipe for a quick and healthy dinner.",
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
          {userMessages.length === 0 ? (
            <PromptSuggestions
              label="Try these ideas ✨"
              append={append}
              suggestions={suggestions}
            />
          ) : (
            <ChatMessages messages={userMessages}>
              <MessageList messages={userMessages} align="left"/>
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
                allowAttachments
                files={files}
                setFiles={setFiles}
              />
            )}
          </ChatForm>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col w-1/2 h-full p-4">
        <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Our <span className="underline decoration-amber-500">Flavors</span></h2>
        <div className="flex-grow overflow-y-auto pr-2">
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
