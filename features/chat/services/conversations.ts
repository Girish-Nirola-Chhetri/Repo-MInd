
import { db } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { chatConversationTable } from "@/db/schema/chat";
import { randomUUID } from "crypto";


type ConversationsProps = {
    repositoryId: string
    userId: string
}

export type ConversationsType = {
    id: string
    userId: string
    repositoryId: string
    title: string
    createdAt: string
    updatedAt: string
}


export async function getConversations(
    { repositoryId, userId }: ConversationsProps
) {

    const conversations = await db
        .select()
        .from( chatConversationTable )
        .where(
            and(
                eq( chatConversationTable.userId, userId ),
                eq( chatConversationTable.repositoryId, repositoryId )
            )
        )
        .orderBy(
            desc( chatConversationTable.updatedAt )
        )

    return conversations
}

export async function createConversation(
    { repositoryId, userId }: ConversationsProps
) {
    const [conversation] = await db
        .insert( chatConversationTable )
        .values({
            id: randomUUID(),
            userId: userId,
            repositoryId: repositoryId,
            title: "New Chat",
            
        })
        .returning()

    if( !conversation ) throw new Error("could not create a chat")

    return conversation
}