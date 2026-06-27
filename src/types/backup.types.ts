/** Shapes returned by `GET /admin/backups` (read straight from the S3 backups bucket). */

export interface BackupItem {
  fileName: string;
  key: string;
  createdAt: string;
  sizeBytes: number;
  size: string;
}

export interface BackupSummary {
  bucket: string;
  region: string;
  total: number;
  latestAt: string | null;
  latestSize: string | null;
  hoursSinceLatest: number | null;
  healthy: boolean;
}

export interface BackupData {
  summary: BackupSummary;
  backups: BackupItem[];
}

export interface BackupResponse {
  statusCode: number;
  data: BackupData;
  message: string;
  success: boolean;
}
