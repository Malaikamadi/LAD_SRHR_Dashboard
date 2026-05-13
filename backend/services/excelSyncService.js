const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const excelService = require('./excelService');

class ExcelSyncService {
  constructor() {
    this.sourceUrl = process.env.EXCEL_SOURCE_URL || null;
    this.localFallbackPath = path.join(__dirname, '../uploads/master_data.xlsx');
    this.syncInterval = process.env.SYNC_INTERVAL || '*/5 * * * *'; // Default 5 mins
  }

  initializeSync() {
    console.log('Initializing Excel Sync Service...');
    
    // Initial fetch
    this.syncData();

    // Schedule subsequent fetches
    cron.schedule(this.syncInterval, () => {
      console.log(`[Cron] Running scheduled Excel sync (${this.syncInterval})...`);
      this.syncData();
    });
  }

  async syncData() {
    try {
      if (!this.sourceUrl) {
        console.log('No EXCEL_SOURCE_URL provided. Using local fallback file.');
        if (fs.existsSync(this.localFallbackPath)) {
          excelService._parseExcelBuffer(fs.readFileSync(this.localFallbackPath));
        } else {
          console.warn('Local fallback file also not found. Please provide a data source.');
        }
        return;
      }

      console.log(`Fetching latest Excel data from ${this.sourceUrl}...`);
      
      const response = await axios({
        method: 'GET',
        url: this.sourceUrl,
        responseType: 'arraybuffer'
      });

      console.log('Excel file downloaded successfully. Parsing data...');
      
      // Parse the downloaded buffer directly in memory
      excelService._parseExcelBuffer(response.data);
      
      // Optionally save it as backup
      fs.writeFileSync(this.localFallbackPath, response.data);
      console.log('Excel data parsed and cache updated.');

    } catch (error) {
      console.error('Error syncing Excel data:', error.message);
      console.log('Falling back to local cached data if available...');
      if (!excelService.dataCache && fs.existsSync(this.localFallbackPath)) {
        excelService._parseExcelBuffer(fs.readFileSync(this.localFallbackPath));
      }
    }
  }
}

module.exports = new ExcelSyncService();
