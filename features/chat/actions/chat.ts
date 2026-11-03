
"use server"

import { db } from "@/db"
import { repoTable } from "@/db/schema/repo-schema"
import { chatConversationTable } from "@/db/schema/chat"

import { getCurrentSession } from "@/features/auth/actions"
import { and, eq } from "drizzle-orm"

import {
    getConversations,
    createConversation,
} from "../services/conversations"

import { getChatMessages } from "../services/messages"
import { chat } from "@/features/chat/services/chat"

import type { ChatMessageType } from "../types/chat"


// Get authenticated user
async function getAuthenticatedUser() {
    const session = await getCurrentSession()

    if (!session) {
        throw new Error("Unauthorized access")
    }

    return session.user
}


// Verify repository ownership
async function verifyRepositoryOwnership(
    repositoryId: string,
    userId: string
) {
    if (!repositoryId?.trim()) {
        throw new Error("Repository ID is required")
    }

    const [repository] = await db
        .select({
            id: repoTable.id,
        })
        .from(repoTable)
        .where(
            and(
                eq(repoTable.id, repositoryId),
                eq(repoTable.userId, userId)
            )
        )
        .limit(1)

    if (!repository) {
        throw new Error("Repository not found")
    }

    return repository
}


// Verify conversation ownership and repository
async function verifyConversationOwnership(
    conversationId: string,
    repositoryId: string,
    userId: string
) {
    if (!conversationId?.trim()) {
        throw new Error("Conversation ID is required")
    }

    const [conversation] = await db
        .select()
        .from(chatConversationTable)
        .where(
            and(
                eq(chatConversationTable.id, conversationId),
                eq(chatConversationTable.userId, userId),
                eq(chatConversationTable.repositoryId, repositoryId)
            )
        )
        .limit(1)

    if (!conversation) {
        throw new Error("Conversation not found")
    }

    return conversation
}


// 1. Get conversations
export async function getConversationsAction(
    repositoryId: string
) {
    const user = await getAuthenticatedUser()

    await verifyRepositoryOwnership(
        repositoryId,
        user.id
    )

    return getConversations({
        repositoryId,
        userId: user.id,
    })
}


// 2. Create conversation
export async function createConversationAction(
    repositoryId: string
) {
    const user = await getAuthenticatedUser()

    await verifyRepositoryOwnership(
        repositoryId,
        user.id
    )

    return createConversation({
        repositoryId,
        userId: user.id,
    })
}


// 3. Get chat messages
export async function getChatMessagesAction(
    conversationId: string,
    repositoryId: string
): Promise<ChatMessageType[]> {
    const user = await getAuthenticatedUser()

    await verifyConversationOwnership(
        conversationId,
        repositoryId,
        user.id
    )

    const messages = await getChatMessages({
        conversationId,
    })

    return messages.map((message) => ({
        id: message.id,
        role: message.role as "user" | "assistant",
        content: message.content ?? "",
    }))
}


// 4. Send message
type SendMessageInput = {
    repositoryId: string
    conversationId: string | null
    content: string
}

type SendMessageResult = {
    conversation: {
        id: string
        title: string
    }
    userMessage: ChatMessageType
    assistantMessage: ChatMessageType
}

export async function sendMessageAction({
    repositoryId,
    conversationId,
    content,
}: SendMessageInput): Promise<SendMessageResult> {
    const user = await getAuthenticatedUser()

    // Validate message
    if (!content?.trim()) {
        throw new Error("Message cannot be empty")
    }

    // Verify repository ownership
    await verifyRepositoryOwnership(repositoryId, user.id)

    // Use existing conversation or create a new one
    const conversation = conversationId
        ? await verifyConversationOwnership(
            conversationId,
            repositoryId,
            user.id
        )
        : await createConversation({
            repositoryId,
            userId: user.id,
        })

    // Generate AI response and update conversation title
    const {
        userMessage,
        assistantMessage,
        title,
    } = await chat({
        conversationId: conversation.id,
        query: content.trim(),
    })

    return {
        conversation: {
            id: conversation.id,
            title,
        },
        userMessage: {
            id: userMessage.id,
            role: "user",
            content: userMessage.content ?? "",
        },
        assistantMessage: {
            id: assistantMessage.id,
            role: "assistant",
            content: assistantMessage.content ?? "",
        },
    }
}