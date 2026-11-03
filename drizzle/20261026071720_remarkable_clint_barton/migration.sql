ALTER TABLE "repositorys" ADD COLUMN "index_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "repositorys" ADD COLUMN "last_indexed_at" timestamp;--> statement-breakpoint
ALTER TABLE "repositorys" ADD COLUMN "last_indexed_commit_Sha" text;--> statement-breakpoint
ALTER TABLE "repositorys" ADD COLUMN "index_error" text;