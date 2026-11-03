import { randomUUID } from "crypto"
import { db } from "@/db"
import { chatConversationTable, chatMessageTable } from "@/db/schema/chat"
import { asc, eq } from "drizzle-orm"

type GetChatMessagesProps = {
    conversationId: string
}

type SaveChatProps = {
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
}

export async function getChatMessages(
    { conversationId }: GetChatMessagesProps
) {

    if( !conversationId.trim() ) throw new Error("conversation Is is required")

    const messages = await db
        .select({
            id: chatMessageTable.id,
            role: chatMessageTable.role,
            content: chatMessageTable.content,
        })
        .from( chatMessageTable )
        .where(
            eq( chatMessageTable.conversationId, conversationId )
        )
        .orderBy(
            asc( chatMessageTable.createdAt )
        )
        
    
    return messages
}


export async function saveChatMessage (
    { conversationId, role, content }: SaveChatProps
) {
    if( !content.trim() ) {
        throw new Error("Message content cannot be empty")
    }

    const [message] = await db
        .insert(chatMessageTable)
        .values({
            id: randomUUID(),
            conversationId,
            role,
            content,
        })
        .returning({
            id: chatMessageTable.id,
            role: chatMessageTable.role,
            content: chatMessageTable.content,
        })

    if( !message ) {
        throw new Error("Could not save message")
    }

    await db
        .update(chatConversationTable)
        .set({
            updatedAt: new Date(),
        })
        .where(
            eq(chatConversationTable.id, conversationId)
        )

    return message;
}