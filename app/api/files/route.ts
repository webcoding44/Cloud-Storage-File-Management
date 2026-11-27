import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/src";
import { filesTable, userStorageQuotasTable } from "@/src/db/schema";
import { getAuthenticatedUser } from "@/src/auth/server";
import { canPreviewContentType, hasValidImageSignature, inspectUploadedFile, safeFileName, type FileCategory } from "@/src/files";
import { storage, storageBucket, storageLimitBytes } from "@/src/storage";

const maxUploadBytes = 10 * 1024 * 1024;
const previewUrlLifetimeSeconds = 60;
const categories: FileCategory[] = ["images", "videos", "audio", "documents", "other-files"];

export async function GET(request: Request) {
  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  const requestedCategory = new URL(request.url).searchParams.get("category");
  if (requestedCategory && !categories.includes(requestedCategory as FileCategory)) {
    return Response.json({ error: "Unknown file category." }, { status: 400 });
  }

  try {
    const ownerFilter = eq(filesTable.ownerId, authResult.user.id);
    const files = await db
      .select({
        id: filesTable.id,
        name: filesTable.name,
        contentType: filesTable.contentType,
        category: filesTable.category,
        size: filesTable.size,
        createdAt: filesTable.createdAt,
        objectKey: filesTable.objectKey,
      })
      .from(filesTable)
      .where(
        requestedCategory
          ? and(ownerFilter, eq(filesTable.category, requestedCategory))
          : ownerFilter,
      )
      .orderBy(desc(filesTable.createdAt));

    const responseFiles = await Promise.all(
      files.map(async ({ objectKey, ...file }) => ({
        ...file,
        ...(file.category === "images" && canPreviewContentType(file.contentType)
          ? {
              previewUrl: await getSignedUrl(
                storage,
                new GetObjectCommand({
                  Bucket: storageBucket,
                  Key: objectKey,
                  ResponseContentDisposition: "inline",
                  ResponseContentType: file.contentType,
                }),
                { expiresIn: previewUrlLifetimeSeconds },
              ),
            }
          : {}),
      })),
    );

    return Response.json({ files: responseFiles }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Unable to load your files right now." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxUploadBytes + 1024 * 1024) {
    return Response.json({ error: "Files must be 10 MB or smaller." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "The upload request is not valid multipart form data." }, { status: 400 });
  }
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "Empty files cannot be uploaded." }, { status: 400 });
  }
  if (file.size > maxUploadBytes) {
    return Response.json({ error: "Files must be 10 MB or smaller." }, { status: 413 });
  }

  const name = safeFileName(file.name);
  if (!name) {
    return Response.json({ error: "The file must have a valid name." }, { status: 400 });
  }

  const inspectedFile = inspectUploadedFile(name, file.type);
  if ("error" in inspectedFile) {
    return Response.json({ error: inspectedFile.error }, { status: 415 });
  }

  const requestedCategory = formData.get("category");
  if (
    requestedCategory !== null &&
    (typeof requestedCategory !== "string" ||
      !categories.includes(requestedCategory as FileCategory) ||
      requestedCategory !== inspectedFile.category)
  ) {
    return Response.json({ error: "The file does not match the requested category." }, { status: 415 });
  }

  const fileBytes = Buffer.from(await file.arrayBuffer());
  if (
    inspectedFile.category === "images" &&
    !hasValidImageSignature(inspectedFile.contentType, fileBytes)
  ) {
    return Response.json({ error: "The uploaded data does not match a supported image format." }, { status: 415 });
  }

  try {
    const [projectUsage, userUsage, quota] = await Promise.all([
      db
        .select({ usedBytes: sql<number>`coalesce(sum(${filesTable.size}), 0)` })
        .from(filesTable)
        .then((rows) => rows[0]),
      db
        .select({ usedBytes: sql<number>`coalesce(sum(${filesTable.size}), 0)` })
        .from(filesTable)
        .where(eq(filesTable.ownerId, authResult.user.id))
        .then((rows) => rows[0]),
      db
        .select({ quotaBytes: userStorageQuotasTable.quotaBytes })
        .from(userStorageQuotasTable)
        .where(eq(userStorageQuotasTable.ownerId, authResult.user.id))
        .then((rows) => rows[0]),
    ]);

    const projectUsedBytes = Number(projectUsage?.usedBytes ?? 0);
    if (projectUsedBytes + file.size > storageLimitBytes) {
      return Response.json({ error: "The shared Neon Object Storage pool is full." }, { status: 413 });
    }

    const userUsedBytes = Number(userUsage?.usedBytes ?? 0);
    if (quota && userUsedBytes + file.size > quota.quotaBytes) {
      return Response.json({ error: "There is not enough storage space for this file." }, { status: 413 });
    }
  } catch {
    return Response.json({ error: "Unable to verify your storage quota right now." }, { status: 503 });
  }

  const objectKey = `users/${encodeURIComponent(authResult.user.id)}/${crypto.randomUUID()}`;
  try {
    await storage.send(
      new PutObjectCommand({
        Bucket: storageBucket,
        Key: objectKey,
        Body: fileBytes,
        ContentType: inspectedFile.contentType,
      }),
    );
  } catch {
    return Response.json({ error: "The file could not be uploaded to Neon Object Storage." }, { status: 502 });
  }

  let savedFile;
  try {
    [savedFile] = await db
      .insert(filesTable)
      .values({
        ownerId: authResult.user.id,
        objectKey,
        name,
        contentType: inspectedFile.contentType,
        category: inspectedFile.category,
        size: file.size,
      })
      .returning({
        id: filesTable.id,
        name: filesTable.name,
        contentType: filesTable.contentType,
        category: filesTable.category,
        size: filesTable.size,
        createdAt: filesTable.createdAt,
      });

    if (!savedFile) throw new Error("File metadata was not returned after insert.");
  } catch {
    try {
      await storage.send(new DeleteObjectCommand({ Bucket: storageBucket, Key: objectKey }));
    } catch {
      return Response.json(
        { error: "File metadata could not be saved, and its uploaded object could not be cleaned up." },
        { status: 500 },
      );
    }
    return Response.json({ error: "The file was uploaded but its metadata could not be saved." }, { status: 503 });
  }

  return Response.json({ file: savedFile }, { status: 201 });
}
