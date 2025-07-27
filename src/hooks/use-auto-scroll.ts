import { useEffect, useRef, useCallback } from "react"

export function useAutoScroll<T extends HTMLElement>(
  dependencies: any[]
) {
  const containerRef = useRef<T>(null)

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, dependencies)

  return {
    containerRef,
    scrollToBottom,
  }
}