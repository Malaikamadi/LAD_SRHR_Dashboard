const excelService = require('../services/excelService');

const getOverview = (req, res) => {
  try {
    const data = excelService.getOverviewData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDistricts = (req, res) => {
  try {
    const data = excelService.getDistrictData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getKpis = (req, res) => {
  try {
    const data = excelService.getKpiData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFinance = (req, res) => {
  try {
    const data = excelService.getFinanceData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOverview,
  getDistricts,
  getKpis,
  getFinance
};
