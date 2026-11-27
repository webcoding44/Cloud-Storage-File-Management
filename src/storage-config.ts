import { S3Client } from "@aws-sdk/client-s3";

export const DEFAULT_NEON_OBJECT_STORAGE_LIMIT_BYTES = 5_000_000_000;

export interface StorageConfiguration {
  bucket: string;
  region: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  limitBytes: number;
}

function requiredEnvironmentVariable(name: string, environment: NodeJS.ProcessEnv) {
  const value = environment[name];
  if (!value) {
    throw new Error(`${name} is required to connect to Neon Object Storage.`);
  }
  return value;
}

export function getStorageLimitBytes(environment: NodeJS.ProcessEnv = process.env) {
  const configuredLimit = environment.NEON_OBJECT_STORAGE_LIMIT_BYTES;
  const limitBytes = configuredLimit === undefined
    ? DEFAULT_NEON_OBJECT_STORAGE_LIMIT_BYTES
    : Number(configuredLimit);

  if (!Number.isSafeInteger(limitBytes) || limitBytes <= 0) {
    throw new Error("NEON_OBJECT_STORAGE_LIMIT_BYTES must be a positive safe integer.");
  }

  return limitBytes;
}

export function getStorageConfiguration(environment: NodeJS.ProcessEnv = process.env): StorageConfiguration {
  return {
    bucket: requiredEnvironmentVariable("NEON_STORAGE_BUCKET", environment),
    region: requiredEnvironmentVariable("AWS_REGION", environment),
    endpoint: requiredEnvironmentVariable("AWS_ENDPOINT_URL_S3", environment),
    accessKeyId: requiredEnvironmentVariable("AWS_ACCESS_KEY_ID", environment),
    secretAccessKey: requiredEnvironmentVariable("AWS_SECRET_ACCESS_KEY", environment),
    limitBytes: getStorageLimitBytes(environment),
  };
}

export function createStorageClient(configuration = getStorageConfiguration()) {
  return new S3Client({
    region: configuration.region,
    endpoint: configuration.endpoint,
    credentials: {
      accessKeyId: configuration.accessKeyId,
      secretAccessKey: configuration.secretAccessKey,
    },
    forcePathStyle: true,
  });
}
