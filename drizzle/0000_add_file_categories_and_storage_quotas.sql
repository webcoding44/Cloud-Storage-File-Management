CREATE TABLE IF NOT EXISTS "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"object_key" varchar(512) NOT NULL,
	"name" varchar(255) NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"category" varchar(24) DEFAULT 'other-files' NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "files_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "category" varchar(24) DEFAULT 'other-files' NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_storage_quotas" (
	"owner_id" varchar(255) PRIMARY KEY NOT NULL,
	"quota_bytes" bigint DEFAULT 536870912000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "files_owner_created_idx" ON "files" USING btree ("owner_id","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "files_owner_category_created_idx" ON "files" USING btree ("owner_id","category","created_at");