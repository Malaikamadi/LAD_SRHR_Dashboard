const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = xlsx.utils.book_new();

// Sheet 1: Raw Health Data (to calculate Maternal Mortality, Contraceptive Usage, etc)
const healthData = [
  { District: 'Western Area Urban', Population: 1200000, LiveBirths: 35000, MaternalDeaths: 120, ANC_Visits: 28000, TeenagePregnancies: 1500, ContraceptiveUsers: 450000, SkilledBirths: 30000 },
  { District: 'Western Area Rural', Population: 500000, LiveBirths: 15000, MaternalDeaths: 80, ANC_Visits: 11000, TeenagePregnancies: 900, ContraceptiveUsers: 180000, SkilledBirths: 12000 },
  { District: 'Bo', Population: 700000, LiveBirths: 21000, MaternalDeaths: 105, ANC_Visits: 16000, TeenagePregnancies: 1200, ContraceptiveUsers: 250000, SkilledBirths: 18000 },
  { District: 'Kenema', Population: 650000, LiveBirths: 19500, MaternalDeaths: 98, ANC_Visits: 14500, TeenagePregnancies: 1100, ContraceptiveUsers: 230000, SkilledBirths: 16000 },
  { District: 'Makeni', Population: 550000, LiveBirths: 16500, MaternalDeaths: 85, ANC_Visits: 12000, TeenagePregnancies: 950, ContraceptiveUsers: 200000, SkilledBirths: 14000 },
  { District: 'Koidu', Population: 400000, LiveBirths: 12000, MaternalDeaths: 65, ANC_Visits: 9000, TeenagePregnancies: 750, ContraceptiveUsers: 150000, SkilledBirths: 10000 }
];
const wsHealth = xlsx.utils.json_to_sheet(healthData);
xlsx.utils.book_append_sheet(wb, wsHealth, "HealthData");

// Sheet 2: Financial Data (Burn Rate)
const financeData = [
  { Category: 'Total Funds Provided', Amount: 60000000 },
  { Category: 'Dispensed', Amount: 59100000 },
  { Category: 'Unspent', Amount: 900000 }
];
const wsFinance = xlsx.utils.json_to_sheet(financeData);
xlsx.utils.book_append_sheet(wb, wsFinance, "Finance");

// Sheet 3: Monthly Burn Rate
const monthlyBurn = [
  { Month: 'Jan', Operational: 380000, Procurement: 290000 },
  { Month: 'Feb', Operational: 420000, Procurement: 310000 },
  { Month: 'Mar', Operational: 395000, Procurement: 340000 },
  { Month: 'Apr', Operational: 450000, Procurement: 360000 },
  { Month: 'May', Operational: 410000, Procurement: 330000 },
  { Month: 'Jun', Operational: 470000, Procurement: 380000 },
  { Month: 'Jul', Operational: 430000, Procurement: 350000 },
  { Month: 'Aug', Operational: 460000, Procurement: 370000 },
  { Month: 'Sep', Operational: 440000, Procurement: 360000 },
  { Month: 'Oct', Operational: 480000, Procurement: 390000 },
  { Month: 'Nov', Operational: 455000, Procurement: 375000 },
  { Month: 'Dec', Operational: 490000, Procurement: 400000 }
];
const wsMonthly = xlsx.utils.json_to_sheet(monthlyBurn);
xlsx.utils.book_append_sheet(wb, wsMonthly, "MonthlyBurn");

// Sheet 4: Implementing Entities KPIs
const entityKPIs = [
  { Entity: 'SLeSHI', Objective: 'Health Financing', KPI_Name: '% population enrolled', Target: 15, Actual: 8.2, Type: 'Outcome', Status: 'behind' },
  { Entity: 'SLeSHI', Objective: 'Health Financing', KPI_Name: 'SLeSHI fund generated', Target: 5000000, Actual: 2100000, Type: 'Outcome', Status: 'behind' },
  { Entity: 'RCH', Objective: 'Service Infrastructure', KPI_Name: 'Facilities with SRH integration', Target: 80, Actual: 85, Type: 'Output', Status: 'achieved' },
  { Entity: 'RCH', Objective: 'Commodities Supply', KPI_Name: 'Stock-out rate', Target: 5, Actual: 8, Type: 'Process', Status: 'on-track' },
  { Entity: 'PHC', Objective: 'Health Professionals', KPI_Name: 'Midwives deployed', Target: 500, Actual: 450, Type: 'Input', Status: 'on-track' }
];
const wsKPIs = xlsx.utils.json_to_sheet(entityKPIs);
xlsx.utils.book_append_sheet(wb, wsKPIs, "KPIs");

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

xlsx.writeFile(wb, path.join(uploadDir, 'master_data.xlsx'));
console.log('Dummy Master Excel file created.');
