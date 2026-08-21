import { S3Client } from '@aws-sdk/client-s3';
import type { R2ClientConfig } from './types';

/**
 * Creates an S3-compatible client connected to Cloudflare R2.
 * Enforces zero-egress architecture by pointing to Cloudflare's R2 endpoint.
 */
export function createR2Client(config: R2ClientConfig): S3Client {
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}
