import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to connect to Neon Object Storage.`);
  }
  return value;
}

export const storageBucket = "assets";

export const storage = new S3Client({
  region: requiredEnvironmentVariable("AWS_REGION"),
  endpoint: requiredEnvironmentVariable("AWS_ENDPOINT_URL_S3"),
  credentials: {
    accessKeyId: requiredEnvironmentVariable("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
  },
  forcePathStyle: true,
});
