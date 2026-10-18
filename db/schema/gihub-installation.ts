import { pgTable, text, bigint, timestamp, varchar, index} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const githubInstallationTable = pgTable('github_installation', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade'}),
    installationId: bigint("installation_id", { mode: "number"}).unique().notNull(),

    // user or organization name
    accountLogin: text("account_login").notNull(),

    // user typr ot organization type
    accountType: varchar("account_type", { length: 20 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()

}, 
    (table) => [
        index("github_installations_user_id_idx").on(table.userId),
    ]
)