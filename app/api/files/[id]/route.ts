import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";
import { db } from "@/src";
import { filesTable } from "@/src/db/schema";
import { getAuthenticatedUser } from "@/src/auth/server";
import { storage, storageBucket } from "@/src/storage";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  const { id } = await params;
  const [file] = await db
    .select()
    .from(filesTable)
    .where(and(eq(filesTable.id, id), eq(filesTable.ownerId, authResult.user.id)))
    .limit(1);

  if (!file) {
    return Response.json({ error: "File not found." }, { status: 404 });
  }

  const [deletedFile] = await db
    .delete(filesTable)
    .where(and(eq(filesTable.id, id), eq(filesTable.ownerId, authResult.user.id)))
    .returning();

  if (!deletedFile) {
    return Response.json({ error: "File was already removed." }, { status: 404 });
  }

  try {
    await storage.send(
      new DeleteObjectCommand({ Bucket: storageBucket, Key: deletedFile.objectKey }),
    );
  } catch (storageError) {
    try {
      await db.insert(filesTable).values(deletedFile);
    } catch (restoreError) {
      throw new AggregateError(
        [storageError, restoreError],
        "Could not delete the stored object or restore its file record.",
      );
    }
    throw storageError;
  }

  return new Response(null, { status: 204 });
}
