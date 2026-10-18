CREATE TABLE "github_installation" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"installation_id" bigint,
	"account_login" text NOT NULL,
	"account_type" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "github_installations_user_id_idx" ON "github_installation" ("user_id");--> statement-breakpoint
ALTER TABLE "github_installation" ADD CONSTRAINT "github_installation_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;