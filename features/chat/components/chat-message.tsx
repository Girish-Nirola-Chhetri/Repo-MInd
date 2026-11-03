"use client"

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

import type { ChatMessageType } from "../types/chat"

type ChatMessageProps = {
    message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "user"

    return (
        <div
            className={cn(
                "flex gap-3",
                isUser && "justify-end"
            )}
        >
            {!isUser && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="size-4 text-primary" />
                </div>
            )}

            <div
                className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[75%]",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground"
                )}
            >
                <div className="whitespace-pre-wrap break-words">
                    {message.content}
                </div>
            </div>

            {isUser && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-4 text-muted-foreground" />
                </div>
            )}
        </div>
    )
}