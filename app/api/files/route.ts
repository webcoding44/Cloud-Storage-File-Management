import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { desc, eq } from "drizzle-orm";
import { db } from "@/src";
import { filesTable } from "@/src/db/schema";
import { getAuthenticatedUser } from "@/src/auth/server";
import { storage, storageBucket } from "@/src/storage";

const maxUploadBytes = 10 * 1024 * 1024;
const downloadUrlLifetimeSeconds = 60;

export async function GET() {
  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  const files = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.ownerId, authResult.user.id))
    .orderBy(desc(filesTable.createdAt))
    .limit(100);

  const result = await Promise.all(
    files.map(async (file) => ({
      id: file.id,
      name: file.name,
      contentType: file.contentType,
      size: file.size,
      createdAt: file.createdAt,
      downloadUrl: await getSignedUrl(
        storage,
        new GetObjectCommand({
          Bucket: storageBucket,
          Key: file.objectKey,
          ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        }),
        { expiresIn: downloadUrlLifetimeSeconds },
      ),
    })),
  );

  return Response.json({ files: result });
}

export async function POST(request: Request) {
  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  const formData = await request.formData();
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

  const id = crypto.randomUUID();
  const objectKey = `${authResult.user.id}/${id}`;
  const contentType = file.type || "application/octet-stream";

  await storage.send(
    new PutObjectCommand({
      Bucket: storageBucket,
      Key: objectKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: contentType,
    }),
  );

  let savedFile;
  try {
    [savedFile] = await db
      .insert(filesTable)
      .values({
        ownerId: authResult.user.id,
        objectKey,
        name: file.name.slice(0, 255),
        contentType,
        size: file.size,
      })
      .returning();
  } catch (databaseError) {
    try {
      await storage.send(new DeleteObjectCommand({ Bucket: storageBucket, Key: objectKey }));
    } catch (cleanupError) {
      throw new AggregateError(
        [databaseError, cleanupError],
        "Could not save file metadata or clean up the uploaded object.",
      );
    }
    throw databaseError;
  }

  if (!savedFile) {
    throw new Error("The file upload completed without returning its database record.");
  }

  return Response.json({ file: savedFile }, { status: 201 });
}
