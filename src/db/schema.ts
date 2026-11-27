import { bigint, index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const filesTable = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: varchar("owner_id", { length: 255 }).notNull(),
    objectKey: varchar("object_key", { length: 512 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 255 }).notNull(),
    category: varchar("category", { length: 24 }).notNull().default("other-files"),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("files_owner_created_idx").on(table.ownerId, table.createdAt),
    index("files_owner_category_created_idx").on(table.ownerId, table.category, table.createdAt),
  ],
);

export const userStorageQuotasTable = pgTable("user_storage_quotas", {
  ownerId: varchar("owner_id", { length: 255 }).primaryKey(),
  quotaBytes: bigint("quota_bytes", { mode: "number" }).notNull().default(500 * 1024 ** 3),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
