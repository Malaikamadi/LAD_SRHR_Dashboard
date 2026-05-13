const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Clean API endpoints
router.get('/dashboard/overview', dashboardController.getOverview);
router.get('/districts', dashboardController.getDistricts);
router.get('/kpis', dashboardController.getKpis);
router.get('/finance', dashboardController.getFinance);
// Add other endpoints as necessary...

module.exports = router;
