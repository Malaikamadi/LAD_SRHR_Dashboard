const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelService {
  constructor() {
    this.filePath = path.join(__dirname, '../uploads/master_data.xlsx');
    this.dataCache = null;
    this.lastModified = null;
  }

  _parseExcelBuffer(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    // Parse individual sheets
    const healthData = xlsx.utils.sheet_to_json(workbook.Sheets['HealthData'] || workbook.Sheets[workbook.SheetNames[0]]);
    const financeData = xlsx.utils.sheet_to_json(workbook.Sheets['Finance'] || workbook.Sheets[workbook.SheetNames[1]]);
    const monthlyBurn = xlsx.utils.sheet_to_json(workbook.Sheets['MonthlyBurn'] || workbook.Sheets[workbook.SheetNames[2]]);
    const kpis = xlsx.utils.sheet_to_json(workbook.Sheets['KPIs'] || workbook.Sheets[workbook.SheetNames[3]]);

    // Calculate aggregated SRHR metrics from Health Data
    let totalPop = 0;
    let totalLiveBirths = 0;
    let totalMaternalDeaths = 0;
    let totalANCVisits = 0;
    let totalTeenagePreg = 0;
    let totalContraceptiveUsers = 0;
    let totalSkilledBirths = 0;

    const districtComparisons = healthData.map(row => {
      totalPop += row.Population || 0;
      totalLiveBirths += row.LiveBirths || 0;
      totalMaternalDeaths += row.MaternalDeaths || 0;
      totalANCVisits += row.ANC_Visits || 0;
      totalTeenagePreg += row.TeenagePregnancies || 0;
      totalContraceptiveUsers += row.ContraceptiveUsers || 0;
      totalSkilledBirths += row.SkilledBirths || 0;

      return {
        district: row.District,
        population: row.Population,
        maternalMortalityRate: row.LiveBirths ? ((row.MaternalDeaths / row.LiveBirths) * 100000).toFixed(1) : 0,
        contraceptivePrevalence: row.Population ? ((row.ContraceptiveUsers / row.Population) * 100).toFixed(1) : 0,
      };
    });

    const nationalMetrics = {
      maternalMortalityRate: totalLiveBirths ? Math.round((totalMaternalDeaths / totalLiveBirths) * 100000) : 0,
      contraceptivePrevalence: totalPop ? ((totalContraceptiveUsers / totalPop) * 100).toFixed(1) : 0,
      skilledBirthAttendance: totalLiveBirths ? ((totalSkilledBirths / totalLiveBirths) * 100).toFixed(1) : 0,
      ancAttendance: totalLiveBirths ? ((totalANCVisits / totalLiveBirths) * 100).toFixed(1) : 0,
      totalTeenagePregnancies: totalTeenagePreg
    };

    // Format Finance Data
    const financeSummary = {};
    financeData.forEach(row => {
      if (row.Category && row.Amount !== undefined) {
        financeSummary[row.Category.replace(/\s+/g, '')] = row.Amount;
      }
    });

    this.dataCache = {
      nationalMetrics,
      districtComparisons,
      financeSummary,
      monthlyBurn,
      kpis
    };
  }

  getOverviewData() {
    return this.dataCache ? this.dataCache.nationalMetrics : null;
  }

  getDistrictData() {
    return this.dataCache ? this.dataCache.districtComparisons : null;
  }

  getKpiData() {
    return this.dataCache ? this.dataCache.kpis : null;
  }

  getFinanceData() {
    return this.dataCache ? {
      summary: this.dataCache.financeSummary,
      monthly: this.dataCache.monthlyBurn
    } : null;
  }
}

module.exports = new ExcelService();
