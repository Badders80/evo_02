import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { VaultUploadOptions, PresignedUrlOptions } from './types';

/**
 * Uploads an immutable legal document to the private R2 vault.
 */
export async function uploadVaultDocument(
  client: S3Client,
  bucketName: string,
  options: VaultUploadOptions,
  body: Uint8Array | string
): Promise<{ key: string; eTag?: string }> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: options.key,
    ContentType: options.contentType,
    Body: body,
    Metadata: options.metadata,
    CacheControl: options.cacheControl || 'private, max-age=31536000, immutable',
  });

  const response = await client.send(command);
  return {
    key: options.key,
    eTag: response.ETag,
  };
}

/**
 * Generates a short-lived presigned download URL for a private vault document (e.g. signed PDS/SA).
 */
export async function getPresignedVaultDownloadUrl(
  client: S3Client,
  bucketName: string,
  key: string,
  options: PresignedUrlOptions = {}
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ResponseContentDisposition: options.downloadFilename
      ? `attachment; filename="${options.downloadFilename}"`
      : undefined,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresInSeconds || 900, // 15 minutes default
  });
}

/**
 * Verifies that an object exists in the vault.
 */
export async function checkVaultDocumentExists(
  client: S3Client,
  bucketName: string,
  key: string
): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}
