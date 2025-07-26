'use client';
import React, { useState } from 'react';
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
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
        )
      );
    }

    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(input);
  };

  const userMessages = messages.filter((msg) => msg.role === 'user');
  const assistantMessages = messages.filter((msg) => msg.role === 'assistant');

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
        <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Your <span className="underline decoration-amber-500">Flavors</span></h2>
        <div className="flex-grow overflow-y-auto pr-2">
          {assistantMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Sparkles className="w-16 h-16 mb-4 text-primary" />
              <p className="text-lg">Start typing on the left to get started.</p>
              <p className="text-sm">Or try some ideas on the left.</p>
            </div>
          ) : (
            <ChatMessages messages={assistantMessages}>
              <MessageList
                messages={assistantMessages}
                isTyping={isGenerating}
                align="right"
              />
            </ChatMessages>
          )}
        </div>
      </div>
    </div>
  );
}
