import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const filesTable = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: varchar("owner_id", { length: 255 }).notNull(),
    objectKey: varchar("object_key", { length: 512 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 255 }).notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("files_owner_created_idx").on(table.ownerId, table.createdAt)],
);
