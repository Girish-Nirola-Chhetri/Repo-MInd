CREATE TABLE "repositorys" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"repo_id" text NOT NULL,
	"repo_name" text NOT NULL,
	"repo_fullname" text NOT NULL,
	"description" text,
	"owner" text NOT NULL,
	"default_branch" text NOT NULL,
	"is_private" boolean NOT NULL,
	"html_url" text NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"language" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_github_repo_unique" ON "repositorys" ("user_id","repo_id");--> statement-breakpoint
ALTER TABLE "repositorys" ADD CONSTRAINT "repositorys_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;