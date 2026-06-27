import api from "@/lib/axios";
import { BackupResponse } from "@/types/backup.types";

export const backupService = {
  /**
   * Reads the daily MongoDB backups straight from the S3 backups bucket.
   * Returns a health summary + the full log of stored snapshots.
   */
  async getBackups(): Promise<BackupResponse> {
    try {
      const response = await api.get("/admin/backups");
      return response.data;
    } catch (error) {
      console.error("Error fetching backups:", error);
      throw error;
    }
  },
};
