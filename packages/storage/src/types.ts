/**
 * Evolution Stables (@evo/storage) Types & Configurations
 * Canonical Authority: evo_00/migration_bridge/03_ASSET_TRANSFERS.md & evo_00/specs/INFRASTRUCTURE_SPEC.md
 */

export interface R2ClientConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicCdnUrl?: string;
}

export interface VaultUploadOptions {
  key: string;
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

export interface PresignedUrlOptions {
  expiresInSeconds?: number;
  downloadFilename?: string;
}

export interface HorseMediaKeys {
  heroConformation: string;
  pedigreeBloodline?: string;
  paradeGallery: string[];
  trackworkVideo?: string;
  trainerAudio?: string;
}

export interface TrainerMediaKeys {
  portrait: string;
  bioVideo?: string;
}

export interface BrandMediaKeys {
  logoGold: string;
  logoWhite: string;
  primarySilks: string;
}
