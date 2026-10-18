import { integer, pgTable, text, boolean, timestamp, uniqueIndex} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const repoTable = pgTable('repositorys', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade'}),

    repoId: text('repo_id').notNull(),
    repoName: text('repo_name').notNull(),
    repoFullName: text('repo_fullname').notNull(),
    description: text('description'),

    owner: text('owner').notNull(),
    defaultBranch: text('default_branch').notNull(),
    isPrivate: boolean('is_private').notNull(),
    htmlUrl: text('html_url').notNull(),

    stars: integer('stars').notNull().default(0),
    language: text('language'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()

}, (table) => [
    // composite unique index on userId and repoId to ensure a user cannot have duplicate repositories
    (uniqueIndex('user_github_repo_unique')).on( table.userId, table.repoId)
])