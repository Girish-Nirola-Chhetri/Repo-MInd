
"use client"

import { useState } from "react"

import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"

import type {
    ChatMessageType,
    ConversationType,
} from "../types/chat"

import {
    getChatMessagesAction,
    sendMessageAction,
} from "../actions/chat"

type ChatWorkspaceProps = {
    repoId: string
    repoName: string
    conversations: ConversationType[]
    activeConversationId: string | null
    messages: ChatMessageType[]
}

export function ChatWorkspace({
    repoId,
    repoName,
    conversations: initialConversations,
    activeConversationId: initialActiveConversationId,
    messages: initialMessages,
}: ChatWorkspaceProps) {

    // Conversation state
    const [conversations, setConversations] =
        useState(initialConversations)

    const [activeConversationId, setActiveConversationId] =
        useState<string | null>(initialActiveConversationId)

    const [chatMessages, setChatMessages] =
        useState<ChatMessageType[]>(initialMessages)

    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Loading states
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [isSendingMessage, setIsSendingMessage] = useState(false)

    // Error state
    const [error, setError] = useState<string | null>(null)

    const isBusy = isLoadingMessages || isSendingMessage


    // 1. Start a new conversation
    function handleNewConversation() {
        if (isBusy) return

        setActiveConversationId(null)
        setChatMessages([])
        setError(null)
    }


    // 2. Select an existing conversation
    async function handleConversationSelection(
        conversationId: string
    ) {
        if (
            conversationId === activeConversationId ||
            isBusy
        ) return

        setIsLoadingMessages(true)
        setError(null)

        try {
            const messages = await getChatMessagesAction(
                conversationId,
                repoId
            )

            // Update state only after history loads successfully
            setActiveConversationId(conversationId)
            setChatMessages(messages)

        } catch (err) {
            console.error("Failed to fetch conversation messages:", err)
            setError("Failed to load this conversation. Please try again.")

        } finally {
            setIsLoadingMessages(false)
        }
    }


    // 3. Send a message
    async function handleSendMessage(content: string) {
        if (
            !content.trim() ||
            isBusy
        ) return

        setIsSendingMessage(true)
        setError(null)

        try {
            const result = await sendMessageAction({
                repositoryId: repoId,
                conversationId: activeConversationId,
                content,
            })

            // Update active conversation
            setActiveConversationId(result.conversation.id)

            // Add conversation to sidebar if it doesn't exist
            setConversations((prev) => {
                const exists = prev.some(
                    (conversation) =>
                        conversation.id === result.conversation.id
                )

                if (exists) {
                    return prev.map((conversation) =>
                        conversation.id === result.conversation.id
                            ? result.conversation
                            : conversation
                    )
                }

                return [result.conversation, ...prev]
            })

            // Append messages
            setChatMessages((prev) => [
                ...prev,
                result.userMessage,
                result.assistantMessage,
            ])

        } catch (err) {
            console.error("Failed to send message:", err)
            setError("Failed to send your message. Please try again.")

            // Rethrow so ChatInput knows the request failed
            throw err

        } finally {
            setIsSendingMessage(false)
        }
    }


    return (
        <div className="flex h-full min-h-0 w-full overflow-hidden bg-background text-foreground">

            {/* Conversation sidebar */}
            <ChatSidebar
                repoName={repoName}
                conversations={conversations}
                activeConversationId={activeConversationId}
                collapsed={sidebarCollapsed}
                isDisabled={isBusy}
                onToggleSidebar={() =>
                    setSidebarCollapsed((prev) => !prev)
                }
                onSelectConversation={handleConversationSelection}
                onNewConversation={handleNewConversation}
            />

            {/* Chat workspace */}
            <main className="flex min-h-0 min-w-0 flex-1 flex-col">

                {/* Messages */}
                <ChatMessages
                    messages={chatMessages}
                    isLoading={isLoadingMessages || isSendingMessage}
                />

                {/* Error message */}
                {error && (
                    <div
                        role="alert"
                        className="mx-auto mb-2 w-full max-w-5xl px-4 text-sm text-destructive"
                    >
                        {error}
                    </div>
                )}

                {/* Message input */}
                <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isBusy}
                    isSending={isSendingMessage}
                />

            </main>
        </div>
    )
}
