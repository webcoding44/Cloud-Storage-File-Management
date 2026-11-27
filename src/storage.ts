import "server-only";
import { createStorageClient, getStorageConfiguration } from "./storage-config";

const configuration = getStorageConfiguration();

export const storageBucket = configuration.bucket;
export const storageLimitBytes = configuration.limitBytes;
export const storage = createStorageClient(configuration);
