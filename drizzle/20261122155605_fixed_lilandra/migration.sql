CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" varchar(255) NOT NULL,
	"object_key" varchar(512) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "files_owner_created_idx" ON "files" ("owner_id","created_at");