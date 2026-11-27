import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";
import { db } from "@/src";
import { filesTable } from "@/src/db/schema";
import { getAuthenticatedUser } from "@/src/auth/server";
import { canPreviewContentType } from "@/src/files";
import { storage, storageBucket } from "@/src/storage";

type RouteParams = { params: Promise<{ id: string }> };
const signedUrlLifetimeSeconds = 60;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: RouteParams) {
  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  const { id } = await params;
  if (!uuidPattern.test(id)) return Response.json({ error: "File not found." }, { status: 404 });

  let file;
  try {
    [file] = await db
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.id, id), eq(filesTable.ownerId, authResult.user.id)))
      .limit(1);
  } catch {
    return Response.json({ error: "Unable to load this file right now." }, { status: 503 });
  }

  if (!file) return Response.json({ error: "File not found." }, { status: 404 });

  const mode = new URL(request.url).searchParams.get("mode") ?? "download";
  if (mode !== "download" && mode !== "preview") {
    return Response.json({ error: "Unknown file access mode." }, { status: 400 });
  }
  if (mode === "preview" && !canPreviewContentType(file.contentType)) {
    return Response.json({ error: "Preview is not supported for this file type." }, { status: 415 });
  }

  try {
    const url = await getSignedUrl(
      storage,
      new GetObjectCommand({
        Bucket: storageBucket,
        Key: file.objectKey,
        ResponseContentDisposition: `${mode === "preview" ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        ResponseContentType: file.contentType,
      }),
      { expiresIn: signedUrlLifetimeSeconds },
    );
    return Response.json(
      { url, expiresIn: signedUrlLifetimeSeconds },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json({ error: "Unable to create secure file access right now." }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authResult = await getAuthenticatedUser();
  if (authResult.response) return authResult.response;

  const { id } = await params;
  if (!uuidPattern.test(id)) return Response.json({ error: "File not found." }, { status: 404 });

  let deletedFile;
  try {
    [deletedFile] = await db
      .delete(filesTable)
      .where(and(eq(filesTable.id, id), eq(filesTable.ownerId, authResult.user.id)))
      .returning();
  } catch {
    return Response.json({ error: "Unable to remove this file right now." }, { status: 503 });
  }

  if (!deletedFile) return Response.json({ error: "File not found." }, { status: 404 });

  try {
    await storage.send(new DeleteObjectCommand({ Bucket: storageBucket, Key: deletedFile.objectKey }));
  } catch {
    try {
      await db.insert(filesTable).values(deletedFile);
    } catch {
      return Response.json(
        { error: "The object could not be deleted and its file record could not be restored." },
        { status: 500 },
      );
    }
    return Response.json({ error: "The object could not be deleted; its file record was restored." }, { status: 502 });
  }

  return new Response(null, { status: 204 });
}
