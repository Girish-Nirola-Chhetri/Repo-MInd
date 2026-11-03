"use client"

import { useEffect, useRef } from "react"
import {Bot, Loader2 }from 'lucide-react'
import { ChatMessage } from "./chat-message"
import type { ChatMessageType } from "../types/chat"


type ChatMessagesProps = {
    messages: ChatMessageType[]
    isLoading: boolean
}
export function ChatMessages(
    {messages, isLoading }: ChatMessagesProps
) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect( () => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        })
    }, [messages, isLoading])

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">

                {messages.length === 0 && (
                    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                            <Bot className="size-7 text-primary" />
                        </div>

                        <h2 className="text-xl font-semibold tracking-tight">
                            Ask your repository anything
                        </h2>

                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Understand code, explore architecture,
                            debug errors, and get answers based on
                            your indexed repository.
                        </p>
                    </div>
                )}

                {messages.map((message: ChatMessageType) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                    />
                ))}

                {isLoading && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                            <Bot className="size-4" />
                        </div>

                        <Loader2 className="size-4 animate-spin" />
                        <p>Thinking...</p>
                    </div>
                )}

                <div ref={bottomRef} />

            </div>
        </div>
    )
}