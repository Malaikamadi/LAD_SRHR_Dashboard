require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const excelSyncService = require('./services/excelSyncService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routing
app.use('/api', apiRoutes);

// Initialize Sync Service (fetch initial data and start cron)
excelSyncService.initializeSync();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
