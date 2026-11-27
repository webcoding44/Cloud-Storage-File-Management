import { existsSync, readFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";
import dotenv from "dotenv";
import pg from "pg";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const { Pool } = pg;
const DEMO_PREFIX = "demo-data";
const args = process.argv.slice(2);
const mode = args[0];
const dryRun = args.includes("--dry-run");

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const payload = Buffer.concat([typeBytes, data]);
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  typeBytes.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(payload), data.length + 8);
  return chunk;
}

function createPng(seed) {
  const width = 360;
  const height = 220;
  const scanlines = Buffer.alloc(height * (width * 3 + 1));
  const colors = [
    [61 + seed * 12, 49, 126 + seed * 10],
    [28, 132 + seed * 5, 151],
  ];

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 3 + 1);
    for (let x = 0; x < width; x += 1) {
      const progress = (x / width + y / height) / 2;
      const offset = rowOffset + 1 + x * 3;
      for (let channel = 0; channel < 3; channel += 1) {
        scanlines[offset + channel] = Math.round(
          colors[0][channel] * (1 - progress) + colors[1][channel] * progress,
        );
      }
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function createPdf() {
  const stream = Buffer.from(
    "BT\n/F1 26 Tf\n72 690 Td\n(CloudNest Project Brief) Tj\n/F1 13 Tf\n0 -38 Td\n(Private file storage, organized for your workspace.) Tj\n0 -24 Td\n(Neon PostgreSQL stores metadata; Neon Object Storage stores files.) Tj\nET\n",
    "ascii",
  );
  const objects = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "ascii"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "ascii"),
    Buffer.from("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", "ascii"),
    Buffer.concat([
      Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, "ascii"),
      stream,
      Buffer.from("endstream", "ascii"),
    ]),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "ascii"),
  ];
  const pieces = [Buffer.from("%PDF-1.4\n", "ascii")];
  const offsets = [0];
  let offset = pieces[0].length;

  objects.forEach((body, index) => {
    offsets.push(offset);
    const object = Buffer.concat([
      Buffer.from(`${index + 1} 0 obj\n`, "ascii"),
      body,
      Buffer.from("\nendobj\n", "ascii"),
    ]);
    pieces.push(object);
    offset += object.length;
  });

  const xrefOffset = offset;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((value) => `${String(value).padStart(10, "0")} 00000 n `),
  ].join("\n");
  pieces.push(Buffer.from(`${xref}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`, "ascii"));
  return Buffer.concat(pieces);
}

function createWav() {
  const sampleRate = 22_050;
  const seconds = 3;
  const sampleCount = sampleRate * seconds;
  const data = Buffer.alloc(sampleCount * 2);
  for (let index = 0; index < sampleCount; index += 1) {
    const fade = Math.min(1, index / 1200, (sampleCount - index) / 1200);
    const sample = Math.sin((2 * Math.PI * 440 * index) / sampleRate) * 0.24 * fade;
    data.writeInt16LE(Math.round(sample * 32767), index * 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function getFixtures() {
  const now = new Date();
  const dateMonthsAgo = (monthsAgo) => new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() - monthsAgo,
    monthsAgo === 0 ? now.getUTCDate() : 1,
  ));
  return [
    { name: "CloudNest-overview.png", contentType: "image/png", category: "images", body: createPng(0), monthsAgo: 5 },
    { name: "Workspace-gallery.png", contentType: "image/png", category: "images", body: createPng(1), monthsAgo: 4 },
    { name: "CloudNest-project-brief.pdf", contentType: "application/pdf", category: "documents", body: createPdf(), monthsAgo: 3 },
    { name: "Monthly-usage.csv", contentType: "text/csv", category: "documents", body: Buffer.from("month,files,storage_bytes\nJanuary,18,246810\nFebruary,24,369120\nMarch,31,512400\n", "utf8"), monthsAgo: 2 },
    { name: "Welcome-tone.wav", contentType: "audio/wav", category: "audio", body: createWav(), monthsAgo: 1 },
    { name: "Workspace-settings.xml", contentType: "application/xml", category: "documents", body: Buffer.from('<?xml version="1.0" encoding="UTF-8"?>\n<workspace name="CloudNest"><privacy>private</privacy><storage>Neon Object Storage</storage></workspace>\n', "utf8"), monthsAgo: 0 },
  ].map((fixture) => ({ ...fixture, createdAt: dateMonthsAgo(fixture.monthsAgo) }));
}

function validateFixtures(fixtures) {
  for (const fixture of fixtures) {
    if (fixture.body.length === 0) throw new Error(`${fixture.name} is empty.`);
    if (fixture.name.endsWith(".png")) {
      if (!fixture.body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        throw new Error(`${fixture.name} has an invalid PNG signature.`);
      }
      let offset = 8;
      let imageData = Buffer.alloc(0);
      let imageHeader;
      let reachedEnd = false;
      while (offset + 12 <= fixture.body.length) {
        const length = fixture.body.readUInt32BE(offset);
        const type = fixture.body.toString("ascii", offset + 4, offset + 8);
        const data = fixture.body.subarray(offset + 8, offset + 8 + length);
        if (offset + length + 12 > fixture.body.length) throw new Error(`${fixture.name} has a truncated PNG chunk.`);
        if (fixture.body.readUInt32BE(offset + length + 8) !== crc32(fixture.body.subarray(offset + 4, offset + length + 8))) {
          throw new Error(`${fixture.name} has an invalid PNG chunk checksum.`);
        }
        if (type === "IHDR") imageHeader = data;
        if (type === "IDAT") imageData = Buffer.concat([imageData, data]);
        offset += length + 12;
        if (type === "IEND") {
          reachedEnd = true;
          break;
        }
      }
      if (!imageHeader || !reachedEnd) throw new Error(`${fixture.name} is not a complete PNG image.`);
      const width = imageHeader.readUInt32BE(0);
      const height = imageHeader.readUInt32BE(4);
      if (imageHeader[8] !== 8 || imageHeader[9] !== 2 || inflateSync(imageData).length !== height * (width * 3 + 1)) {
        throw new Error(`${fixture.name} has invalid PNG image data.`);
      }
    }
    if (fixture.name.endsWith(".pdf")) {
      if (!fixture.body.subarray(0, 8).equals(Buffer.from("%PDF-1.4", "ascii"))) {
        throw new Error(`${fixture.name} has an invalid PDF signature.`);
      }
      const pdf = fixture.body.toString("ascii");
      const xrefOffset = Number(pdf.match(/startxref\n(\d+)\n%%EOF/)?.[1]);
      if (!Number.isInteger(xrefOffset) || fixture.body.toString("ascii", xrefOffset, xrefOffset + 4) !== "xref") {
        throw new Error(`${fixture.name} has an invalid PDF cross-reference table.`);
      }
    }
    if (fixture.name.endsWith(".wav")) {
      if (
        fixture.body.toString("ascii", 0, 4) !== "RIFF" ||
        fixture.body.toString("ascii", 8, 12) !== "WAVE" ||
        fixture.body.readUInt32LE(40) !== fixture.body.length - 44 ||
        fixture.body.readUInt16LE(22) !== 1
      ) {
        throw new Error(`${fixture.name} has invalid WAV data.`);
      }
    }
    if (fixture.name.endsWith(".xml") && !fixture.body.toString("utf8").startsWith("<?xml")) {
      throw new Error(`${fixture.name} is not an XML document.`);
    }
  }
}

function loadEnvironment() {
  const inheritedKeys = new Set(Object.keys(process.env));
  for (const envFile of [".env", ".env.local"]) {
    if (!existsSync(envFile)) continue;
    const values = dotenv.parse(readFileSync(envFile));
    for (const [name, value] of Object.entries(values)) {
      if (!inheritedKeys.has(name)) process.env[name] = value;
    }
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function checkDemoTarget(modeName) {
  const enableFlag = modeName === "seed" ? "ENABLE_DEMO_SEED" : "ENABLE_DEMO_CLEANUP";
  if (required(enableFlag) !== "true") throw new Error(`${enableFlag} must be set to true.`);
  const demoUserId = required("DEMO_USER_ID");
  const demoKeyUserId = encodeURIComponent(demoUserId);
  if (required("DEMO_USER_VERIFIED") !== "true") {
    throw new Error("Set DEMO_USER_VERIFIED=true only after confirming this is your dedicated demo account.");
  }
  const expectedBranch = required("DEMO_BRANCH_NAME");
  if (modeName === "cleanup" && required("DEMO_CLEANUP_CONFIRM") !== "DELETE_DEMO_DATA") {
    throw new Error('Set DEMO_CLEANUP_CONFIRM="DELETE_DEMO_DATA" to confirm cleanup.');
  }

  if (!existsSync(".neon")) throw new Error("A linked Neon branch is required; .neon was not found.");
  const neonConfig = JSON.parse(readFileSync(".neon", "utf8"));
  const linkedBranch = neonConfig.branch;
  if (typeof linkedBranch !== "string" || linkedBranch !== expectedBranch) {
    throw new Error("DEMO_BRANCH_NAME must exactly match the branch linked in .neon.");
  }
  if (!/^demo-[a-z0-9][a-z0-9-]*$/i.test(linkedBranch)) {
    throw new Error("Demo data is allowed only on a dedicated branch named demo-<description>.");
  }
  if (required("DEMO_STORAGE_BRANCH_VERIFIED") !== "true") {
    throw new Error("Confirm the database URL and storage credentials were pulled from the same linked Neon branch.");
  }

  const databaseUrl = required("DATABASE_URL");
  const databaseHost = new URL(databaseUrl).hostname;
  if (!databaseHost.endsWith(".neon.tech")) {
    throw new Error("DATABASE_URL must point to a Neon branch.");
  }

  const storageConfiguration = {
    bucket: required("NEON_STORAGE_BUCKET"),
    region: required("AWS_REGION"),
    endpoint: required("AWS_ENDPOINT_URL_S3"),
    accessKeyId: required("AWS_ACCESS_KEY_ID"),
    secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
  };
  if (!/^https:\/\//i.test(storageConfiguration.endpoint)) {
    throw new Error("AWS_ENDPOINT_URL_S3 must be the HTTPS endpoint for the linked Neon branch.");
  }

  return { demoUserId, demoKeyUserId, linkedBranch, databaseUrl, storageConfiguration };
}

async function seed({ demoUserId, demoKeyUserId, linkedBranch, databaseUrl, storageConfiguration }, fixtures) {
  const pool = new Pool({ connectionString: databaseUrl });
  const storage = new S3Client({
    region: storageConfiguration.region,
    endpoint: storageConfiguration.endpoint,
    credentials: {
      accessKeyId: storageConfiguration.accessKeyId,
      secretAccessKey: storageConfiguration.secretAccessKey,
    },
    forcePathStyle: true,
  });
  const keys = fixtures.map((fixture) => `${DEMO_PREFIX}/${demoKeyUserId}/${fixture.name}`);

  try {
    const existingRows = await pool.query(
      "SELECT object_key, owner_id FROM files WHERE object_key = ANY($1::varchar[])",
      [keys],
    );
    const existing = new Map(existingRows.rows.map((row) => [row.object_key, row.owner_id]));
    for (const key of keys) {
      if (existing.has(key) && existing.get(key) !== demoUserId) {
        throw new Error("A demo storage key is already associated with a different owner.");
      }
    }

    const pendingFixtures = fixtures.filter((fixture) => !existing.has(`${DEMO_PREFIX}/${demoKeyUserId}/${fixture.name}`));
    const addedBytes = pendingFixtures.reduce((total, fixture) => total + fixture.body.length, 0);
    const [projectUsage, userUsage, quota] = await Promise.all([
      pool.query("SELECT coalesce(sum(size), 0)::bigint AS used_bytes FROM files"),
      pool.query("SELECT coalesce(sum(size), 0)::bigint AS used_bytes FROM files WHERE owner_id = $1", [demoUserId]),
      pool.query("SELECT quota_bytes FROM user_storage_quotas WHERE owner_id = $1", [demoUserId]),
    ]);
    const rawLimit = process.env.NEON_OBJECT_STORAGE_LIMIT_BYTES ?? "5000000000";
    const capacity = Number(rawLimit);
    if (!Number.isSafeInteger(capacity) || capacity <= 0) {
      throw new Error("NEON_OBJECT_STORAGE_LIMIT_BYTES must be a positive safe integer.");
    }
    const projectUsedBytes = Number(projectUsage.rows[0].used_bytes);
    const userUsedBytes = Number(userUsage.rows[0].used_bytes);
    const userQuota = quota.rows[0] ? Number(quota.rows[0].quota_bytes) : Number.POSITIVE_INFINITY;
    if (projectUsedBytes + addedBytes > capacity) {
      throw new Error("The shared Neon Object Storage limit would be exceeded by this seed.");
    }
    if (userUsedBytes + addedBytes > userQuota) {
      throw new Error("The demo user's configured storage quota would be exceeded.");
    }

    let seededCount = 0;
    for (const fixture of pendingFixtures) {
      const objectKey = `${DEMO_PREFIX}/${demoKeyUserId}/${fixture.name}`;
      await storage.send(new PutObjectCommand({
        Bucket: storageConfiguration.bucket,
        Key: objectKey,
        Body: fixture.body,
        ContentType: fixture.contentType,
      }));

      try {
        await pool.query(
          `INSERT INTO files (owner_id, object_key, name, content_type, category, size, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [demoUserId, objectKey, fixture.name, fixture.contentType, fixture.category, fixture.body.length, fixture.createdAt],
        );
        seededCount += 1;
      } catch (error) {
        try {
          await storage.send(new DeleteObjectCommand({ Bucket: storageConfiguration.bucket, Key: objectKey }));
        } catch (cleanupError) {
          throw new AggregateError([error, cleanupError], `Metadata insert failed and ${fixture.name} could not be compensated.`);
        }
        throw error;
      }
    }
    console.log(`Seeded ${seededCount} demo files on Neon branch "${linkedBranch}".`);
  } finally {
    await Promise.all([pool.end(), storage.destroy()]);
  }
}

async function cleanup({ demoUserId, demoKeyUserId, linkedBranch, databaseUrl, storageConfiguration }) {
  const pool = new Pool({ connectionString: databaseUrl });
  const storage = new S3Client({
    region: storageConfiguration.region,
    endpoint: storageConfiguration.endpoint,
    credentials: {
      accessKeyId: storageConfiguration.accessKeyId,
      secretAccessKey: storageConfiguration.secretAccessKey,
    },
    forcePathStyle: true,
  });
  const prefix = `${DEMO_PREFIX}/${demoKeyUserId}/`;

  try {
    const objectKeys = [];
    let continuationToken;
    do {
      const page = await storage.send(new ListObjectsV2Command({
        Bucket: storageConfiguration.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }));
      objectKeys.push(...(page.Contents ?? []).flatMap((object) => object.Key ? [object.Key] : []));
      if (page.IsTruncated && !page.NextContinuationToken) {
        throw new Error("Neon Object Storage did not return a continuation token while listing demo objects.");
      }
      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (continuationToken);

    const result = await pool.query(
      "SELECT object_key FROM files WHERE owner_id = $1 AND left(object_key, length($2)) = $2 ORDER BY object_key",
      [demoUserId, prefix],
    );
    for (const objectKey of objectKeys) {
      await storage.send(new DeleteObjectCommand({
        Bucket: storageConfiguration.bucket,
        Key: objectKey,
      }));
    }
    if (result.rows.length > 0) {
      await pool.query(
        "DELETE FROM files WHERE owner_id = $1 AND object_key = ANY($2::varchar[])",
        [demoUserId, result.rows.map((row) => row.object_key)],
      );
    }
    console.log(`Removed ${objectKeys.length} demo objects and ${result.rows.length} metadata rows from Neon branch "${linkedBranch}".`);
  } finally {
    await Promise.all([pool.end(), storage.destroy()]);
  }
}

async function main() {
  const fixtures = getFixtures();
  validateFixtures(fixtures);
  if (mode === "fixtures") {
    for (const fixture of fixtures) console.log(`${fixture.name}: valid (${fixture.body.length} bytes)`);
    return;
  }
  if (mode !== "seed" && mode !== "cleanup") {
    throw new Error("Usage: node scripts/demo-data.mjs <fixtures|seed|cleanup> [--dry-run]");
  }

  loadEnvironment();
  const target = checkDemoTarget(mode);
  if (dryRun) {
    if (mode === "seed") {
      const totalBytes = fixtures.reduce((total, fixture) => total + fixture.body.length, 0);
      console.log(`Dry run: ${fixtures.length} files (${totalBytes} bytes) for the configured demo account on "${target.linkedBranch}".`);
    } else {
      console.log(`Dry run: cleanup is restricted to ${DEMO_PREFIX}/<configured-user-id>/ on "${target.linkedBranch}".`);
    }
    return;
  }

  if (mode === "seed") await seed(target, fixtures);
  else await cleanup(target);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Demo data operation failed.");
  process.exitCode = 1;
});
