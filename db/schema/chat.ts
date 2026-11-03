import { pgTable, text, timestamp, index} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { repoTable } from "./repo-schema";

export const chatConversationTable = pgTable('chat_conversation_table', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references( () => user.id, {onDelete: 'cascade'}),
    repositoryId: text('repoId').notNull().references( () => repoTable.id, { onDelete: 'cascade'}),
    
    title: text('title').notNull().default('new chat'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
}, 
    (table) =>  [
        index("chat_conversation_user_repo_idx").on(
            table.userId,
            table.repositoryId
        ),
        index("chat_conversation_updated_at_idx").on(
            table.updatedAt
        ),
    ]
)

export const chatMessageTable = pgTable('chat_message_table', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').notNull().references( () => chatConversationTable.id, { onDelete: 'cascade'}),
    role: text('role').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow().notNull(),

}, 
    (table) => [
        index("chat_message_conversation_idx").on(
            table.conversationId
        ),
    ]
)
