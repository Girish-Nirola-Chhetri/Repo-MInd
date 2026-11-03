CREATE TABLE "chat_conversation_table" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"repoId" text NOT NULL,
	"title" text DEFAULT 'new chat' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_message_table" (
	"id" text PRIMARY KEY,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chat_conversation_user_repo_idx" ON "chat_conversation_table" ("user_id","repoId");--> statement-breakpoint
CREATE INDEX "chat_conversation_updated_at_idx" ON "chat_conversation_table" ("updated_at");--> statement-breakpoint
CREATE INDEX "chat_message_conversation_idx" ON "chat_message_table" ("conversation_id");--> statement-breakpoint
ALTER TABLE "chat_conversation_table" ADD CONSTRAINT "chat_conversation_table_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "chat_conversation_table" ADD CONSTRAINT "chat_conversation_table_repoId_repositorys_id_fkey" FOREIGN KEY ("repoId") REFERENCES "repositorys"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "chat_message_table" ADD CONSTRAINT "chat_message_table_q8WJ6rL98Mdh_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversation_table"("id") ON DELETE CASCADE;