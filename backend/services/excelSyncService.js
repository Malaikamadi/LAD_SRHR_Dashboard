// Pulls the master Excel from the configured EXCEL_SOURCE_URL on a cron schedule,
// falling back to a local cached file if the network fetch fails.

const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const excelService = require('./excelService');

class ExcelSyncService {
  constructor() {
    this.sourceUrl = process.env.EXCEL_SOURCE_URL || null;
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.localFallbackPath = path.join(this.uploadsDir, 'master_data.xlsx');
    this.syncInterval = process.env.SYNC_INTERVAL || '*/5 * * * *';

    // Render's container starts with a fresh ephemeral filesystem and we gitignore
    // backend/uploads/, so make sure the dir exists before we try to write to it.
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }
    } catch (err) {
      console.warn('[ExcelSync] Could not create uploads directory:', err.message);
    }
  }

  initializeSync() {
    console.log('[ExcelSync] Initializing…');
    console.log(`[ExcelSync] Source: ${this.sourceUrl || '(none — using local fallback only)'}`);
    console.log(`[ExcelSync] Schedule: ${this.syncInterval}`);

    this.syncData();

    cron.schedule(this.syncInterval, () => {
      console.log(`[ExcelSync] Cron tick (${this.syncInterval})`);
      this.syncData();
    });
  }

  async syncData() {
    try {
      if (!this.sourceUrl) {
        if (fs.existsSync(this.localFallbackPath)) {
          console.log('[ExcelSync] No EXCEL_SOURCE_URL — using local fallback.');
          excelService._parseExcelBuffer(fs.readFileSync(this.localFallbackPath));
          console.log('[ExcelSync] Parsed local fallback successfully.');
        } else {
          console.warn('[ExcelSync] No source URL and no local fallback — backend has no data.');
        }
        return;
      }

      console.log(`[ExcelSync] Fetching ${this.sourceUrl}`);

      const response = await axios({
        method: 'GET',
        url: this.sourceUrl,
        responseType: 'arraybuffer',
        timeout: 90000,
        maxRedirects: 10,
      });

      excelService._parseExcelBuffer(response.data);
      fs.writeFileSync(this.localFallbackPath, response.data);
      console.log('[ExcelSync] Synced and parsed master Excel successfully.');
    } catch (error) {
      console.error('[ExcelSync] Sync failed:', error.message);
      excelService.lastError = error.message;

      if (!excelService.isReady() && fs.existsSync(this.localFallbackPath)) {
        try {
          console.log('[ExcelSync] Falling back to last cached copy on disk…');
          excelService._parseExcelBuffer(fs.readFileSync(this.localFallbackPath));
          console.log('[ExcelSync] Loaded cached copy.');
        } catch (fallbackErr) {
          console.error('[ExcelSync] Local fallback also failed:', fallbackErr.message);
        }
      }
    }
  }
}

module.exports = new ExcelSyncService();
