
import { db } from "@/db"
import { saveChatMessage } from "./messages"
import { chatConversationTable } from "@/db/schema/chat"
import { eq } from "drizzle-orm"
import { repoTable } from "@/db/schema/repo-schema"
import { ChatRepo } from "@/features/retrival/services/chat"

export async function getRepositoryId(conversationId: string) {
    if (!conversationId.trim()) {
        throw new Error("Conversation id cannot be empty")
    }

    const [conversation] = await db
        .select({
            repoId: repoTable.repoId,
        })
        .from(chatConversationTable)
        .innerJoin(
            repoTable,
            eq(chatConversationTable.repositoryId, repoTable.id)
        )
        .where(eq(chatConversationTable.id, conversationId))
        .limit(1)

    if (!conversation) {
        throw new Error("Conversation or repository not found")
    }

    return conversation.repoId
}

type ChatProps = {
    conversationId: string
    query: string
}

function generateChatTitle(query: string) {
    const normalized = query.trim().replace(/\s+/g, " ")

    if (normalized.length <= 40) return normalized

    return normalized.slice(0, 37).trimEnd() + "..."
}

async function updateConversationTitle(
    conversationId: string,
    query: string
) {
    const title = generateChatTitle(query)

    await db
        .update(chatConversationTable)
        .set({ title })
        .where(eq(chatConversationTable.id, conversationId))

    return title
}

export async function chat({ conversationId, query }: ChatProps) {
    const repoId = await getRepositoryId(conversationId)

    if (!repoId) {
        throw new Error("Could not get repository")
    }

    // Save user message
    const userMessage = await saveChatMessage({
        conversationId,
        role: "user",
        content: query,
    })

    // Update title only if this is the first message
    const [conversation] = await db
        .select({
            title: chatConversationTable.title,
        })
        .from(chatConversationTable)
        .where(eq(chatConversationTable.id, conversationId))
        .limit(1)

    if (conversation?.title === "New Chat") {
        await updateConversationTitle(conversationId, query)
    }

    // Generate response
    const response = await ChatRepo({
        repoId,
        query,
    })

    // Save assistant response
    const assistantMessage = await saveChatMessage({
        conversationId,
        role: "assistant",
        content: response,
    })

    return {
        userMessage,
        assistantMessage,
        title: conversation?.title ?? generateChatTitle(query),
    }
}
