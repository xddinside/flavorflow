import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@/components/ui/chat-message"
import { TypingIndicator } from "@/components/ui/typing-indicator"

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>

interface MessageListProps {
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  align?: "left" | "right" | "center"
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions)
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  align = 'left',
  messageOptions,
}: MessageListProps) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            align={align}
            {...message}
            {...additionalOptions}
          />
        )
      })}
      {isTyping && <TypingIndicator />}
    </div>
  )
}
