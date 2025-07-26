"use client"
 
import { useEffect } from "react"
import { useChat, type UseChatOptions } from "@ai-sdk/react"
 
import { cn } from "@/lib/utils"
import { Chat } from "@/components/ui/chat"
 
type ChatDemoProps = {
  initialMessages?: UseChatOptions["initialMessages"]
}
 
export default function ChatDemo(props: ChatDemoProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    status,
    setMessages,
  } = useChat({
    ...props,
    api: "/api/chat",
  })

  useEffect(() => {
    const processMessages = async () => {
      const updatedMessages = await Promise.all(
        messages.map(async (message) => {
          if (message.role === "assistant" && message.content.includes("[IMAGE:")) {
            const imageRegex = /\[IMAGE:\s*(.*?)\]/g;
            let newContent = message.content;
            let match;
            const imagePromises: Promise<void>[] = [];

            while ((match = imageRegex.exec(message.content)) !== null) {
              const description = match[1];
              const placeholder = match[0];

              imagePromises.push(
                (async () => {
                  try {
                    const response = await fetch("/api/generate-image", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ description }),
                    });
                    const data = await response.json();
                    if (data.imageUrl) {
                      newContent = newContent.replace(
                        placeholder,
                        `<img src="${data.imageUrl}" alt="${description}" width="300" height="200" />`
                      );
                    }
                  } catch (error) {
                    console.error("Error generating image:", error);
                  }
                })()
              );
            }
            await Promise.all(imagePromises);
            return { ...message, content: newContent };
          }
          return message;
        })
      );
      // Only update if messages have actually changed to prevent infinite loops
      if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
        if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
        setMessages(updatedMessages);
      }
      }
    };

    processMessages();
  }, [messages, setMessages]);
 
  const isLoading = status === "submitted" || status === "streaming"
 
  return (
    <div className={cn("flex", "flex-col", "h-[500px]", "w-full")}>
      <Chat
        className="grow"
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        setMessages={setMessages}
        suggestions={[
          "What is the weather in San Francisco?",
          "Explain step-by-step how to solve this math problem: If x² + 6x + 9 = 25, what is x?",
          "Design a simple algorithm to find the longest palindrome in a string.",
        ]}
      />
    </div>
  )
}
