
"use client"

import {
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
} from "react"

import { ArrowUp, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type ChatInputProps = {
    onSendMessage: (content: string) => Promise<void>
    disabled?: boolean
    isSending?: boolean
}

const MAX_HEIGHT = 160

export function ChatInput({
    onSendMessage,
    disabled = false,
    isSending = false,
}: ChatInputProps) {
    const [message, setMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    function handleChange(value: string) {
        setMessage(value)

        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = "auto"

        const nextHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT)

        textarea.style.height = `${nextHeight}px`
        textarea.style.overflowY =
            textarea.scrollHeight > MAX_HEIGHT ? "auto" : "hidden"
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const content = message.trim()

        if (!content || disabled || isSending) return

        try {
            await onSendMessage(content)
            setMessage("")

            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
                textareaRef.current.style.overflowY = "hidden"
            }
        } catch (error) {
            // Keep the message if sending fails.
            console.error("Failed to send message:", error)
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()

            if (!disabled && !isSending && message.trim()) {
                e.currentTarget.form?.requestSubmit()
            }
        }
    }

    return (
        <div className="shrink-0 bg-background px-4 pb-3 pt-2 sm:px-6">
            <form
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-5xl"
            >
                <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/50">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your repository..."
                        disabled={disabled || isSending}
                        rows={1}
                        className="min-h-10 max-h-40 flex-1 resize-none overflow-y-hidden border-0 bg-transparent px-3 py-2 text-sm leading-6 shadow-none focus-visible:ring-0"
                    />

                    <Button
                        type="submit"
                        size="icon"
                        disabled={
                            !message.trim() || disabled || isSending
                        }
                        className="size-9 shrink-0 rounded-xl"
                        aria-label="Send message"
                    >
                        {isSending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <ArrowUp className="size-4" />
                        )}
                    </Button>
                </div>

                <p className="mt-2 text-center text-xs text-muted-foreground">
                    AI-generated responses may contain inaccuracies. Verify important code suggestions.
                </p>
            </form>
        </div>
    )
}
