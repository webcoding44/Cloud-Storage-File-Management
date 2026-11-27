import { connection } from "next/server";
import { and, count, eq, gte, max, sql } from "drizzle-orm";
import { db } from "@/src";
import { filesTable } from "@/src/db/schema";
import { getAuthenticatedUser } from "@/src/auth/server";
import type { FileCategory } from "@/src/files";
import { getStorageLimitBytes } from "@/src/storage-config";

const categories: FileCategory[] = ["images", "videos", "audio", "documents", "other-files"];

export async function GET() {
  await connection();

  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  try {
    const now = new Date();
    const historyStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthExpression = sql<string>`to_char(date_trunc('month', ${filesTable.createdAt}), 'YYYY-MM')`;
    const dayExpression = sql<string>`to_char(date_trunc('day', ${filesTable.createdAt}), 'YYYY-MM-DD')`;

    const [groupedFiles, projectUsageRows, monthlyRows, dailyRows, lastUploadRows] = await Promise.all([
      db
        .select({
          category: filesTable.category,
          fileCount: count(),
          totalBytes: sql<number>`coalesce(sum(${filesTable.size}), 0)`,
        })
        .from(filesTable)
        .where(eq(filesTable.ownerId, authResult.user.id))
        .groupBy(filesTable.category),
      db
        .select({
          usedBytes: sql<number>`coalesce(sum(${filesTable.size}), 0)`,
        })
        .from(filesTable),
      db
        .select({
          month: monthExpression,
          fileCount: count(),
          totalBytes: sql<number>`coalesce(sum(${filesTable.size}), 0)`,
        })
        .from(filesTable)
        .where(and(eq(filesTable.ownerId, authResult.user.id), gte(filesTable.createdAt, historyStart)))
        .groupBy(monthExpression),
      db
        .select({
          day: dayExpression,
          fileCount: count(),
          totalBytes: sql<number>`coalesce(sum(${filesTable.size}), 0)`,
        })
        .from(filesTable)
        .where(and(eq(filesTable.ownerId, authResult.user.id), gte(filesTable.createdAt, last30DaysStart)))
        .groupBy(dayExpression),
      db
        .select({ lastUploadedAt: max(filesTable.createdAt) })
        .from(filesTable)
        .where(eq(filesTable.ownerId, authResult.user.id)),
    ]);

    const categoryStats = new Map<FileCategory, { fileCount: number; totalBytes: number }>(
      categories.map((category) => [category, { fileCount: 0, totalBytes: 0 }]),
    );

    for (const row of groupedFiles) {
      const category = categories.includes(row.category as FileCategory)
        ? (row.category as FileCategory)
        : "other-files";
      const current = categoryStats.get(category)!;
      current.fileCount += Number(row.fileCount);
      current.totalBytes += Number(row.totalBytes);
    }

    const categoryTotals = categories.map((category) => ({
      category,
      ...categoryStats.get(category)!,
    }));
    const personalUsedBytes = categoryTotals.reduce((total, category) => total + category.totalBytes, 0);
    const personalFileCount = categoryTotals.reduce((total, category) => total + category.fileCount, 0);
    const projectUsedBytes = Number(projectUsageRows[0]?.usedBytes ?? 0);
    const monthlyByKey = new Map(monthlyRows.map((row) => [row.month, {
      fileCount: Number(row.fileCount),
      totalBytes: Number(row.totalBytes),
    }]));
    const sixMonthHistory = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
      const monthKey = `${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, "0")}`;
      const values = monthlyByKey.get(monthKey) ?? { fileCount: 0, totalBytes: 0 };
      return {
        label: monthDate.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
        ...values,
      };
    });
    const weeklyHistory = Array.from({ length: 5 }, (_, index) => ({
      label: `Week ${index + 1}`,
      fileCount: 0,
      totalBytes: 0,
    }));

    for (const row of dailyRows) {
      const day = new Date(`${row.day}T00:00:00.000Z`);
      const index = Math.min(4, Math.floor((day.getTime() - last30DaysStart.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      const bucket = weeklyHistory[Math.max(0, index)];
      bucket.fileCount += Number(row.fileCount);
      bucket.totalBytes += Number(row.totalBytes);
    }
    const lastUploadedAt = lastUploadRows[0]?.lastUploadedAt ?? null;
    const projectCapacityBytes = getStorageLimitBytes();

    return Response.json(
      {
        projectPool: {
          capacityBytes: projectCapacityBytes,
          usedBytes: projectUsedBytes,
          remainingBytes: Math.max(0, projectCapacityBytes - projectUsedBytes),
          usagePercent: projectCapacityBytes > 0
            ? Math.min(100, (projectUsedBytes / projectCapacityBytes) * 100)
            : 0,
        },
        personal: {
          usedBytes: personalUsedBytes,
          fileCount: personalFileCount,
          uploadedThisMonth: Number(monthlyByKey.get(
            `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
          )?.fileCount ?? 0),
          lastUploadedAt: lastUploadedAt?.toISOString() ?? null,
          categories: categoryTotals,
          history: {
            sixMonths: sixMonthHistory,
            last30Days: weeklyHistory,
          },
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Storage statistics request failed.", error);
    return Response.json({ error: "Unable to load your storage statistics right now." }, { status: 503 });
  }
}
