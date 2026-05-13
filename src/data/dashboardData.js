// ========================================
// SRHR Dashboard — Data Layer v3
// ========================================

export const implementingEntities = [
  { id: 'sleshi', name: 'Sierra Leone Social Health Insurance (SLeSHI)', abbrev: 'SLeSHI', lat: 8.484, lng: -13.234, tasksTotal: 18, tasksCompleted: 12, progress: 67, color: '#14B8A6', budget: 1200000, spent: 890000 },
  { id: 'phc', name: 'Directorate of Primary Health Care (PHC)', abbrev: 'PHC', lat: 8.38, lng: -13.15, tasksTotal: 22, tasksCompleted: 18, progress: 82, color: '#06B6D4', budget: 1500000, spent: 1180000 },
  { id: 'rch', name: 'Directorate of Reproductive and Child Health (RCH)', abbrev: 'RCH', lat: 7.964, lng: -11.738, tasksTotal: 25, tasksCompleted: 20, progress: 80, color: '#8B5CF6', budget: 1800000, spent: 1350000 },
  { id: 'dppi', name: 'Directorate of Policy Planning and Information (DPPI)', abbrev: 'DPPI', lat: 9.083, lng: -12.050, tasksTotal: 15, tasksCompleted: 14, progress: 93, color: '#F59E0B', budget: 600000, spent: 540000 },
  { id: 'nems', name: 'Directorate of National Emergency Medical Services (NEMS)', abbrev: 'NEMS', lat: 7.526, lng: -12.505, tasksTotal: 12, tasksCompleted: 8, progress: 67, color: '#EF4444', budget: 450000, spent: 310000 },
  { id: 'gender', name: 'Directorate of Gender Sciences (Gender)', abbrev: 'Gender', lat: 8.284, lng: -10.572, tasksTotal: 14, tasksCompleted: 10, progress: 71, color: '#EC4899', budget: 500000, spent: 380000 },
  { id: 'nmsa', name: 'National Medical Supplies Agency (NMSA)', abbrev: 'NMSA', lat: 9.126, lng: -12.917, tasksTotal: 20, tasksCompleted: 17, progress: 85, color: '#10B981', budget: 1100000, spent: 920000 },
  { id: 'donor_coord', name: 'Directorate of Donor Coordination', abbrev: 'Donor Coord.', lat: 8.644, lng: -10.850, tasksTotal: 10, tasksCompleted: 9, progress: 90, color: '#3B82F6', budget: 350000, spent: 310000 },
  { id: 'comahs', name: 'College of Medicine and Allied Health Sciences (COMAHS)', abbrev: 'COMAHS', lat: 8.159, lng: -12.431, tasksTotal: 16, tasksCompleted: 11, progress: 69, color: '#F97316', budget: 700000, spent: 490000 },
  { id: 'postgraduate', name: 'Directorate of Post Graduate College of Health Specialties', abbrev: 'Postgraduate', lat: 8.767, lng: -12.787, tasksTotal: 8, tasksCompleted: 6, progress: 75, color: '#6366F1', budget: 186711, spent: 145000 },
];

export const kpiData = [
  { id: 'mmr', title: 'Maternal Mortality Rate', value: 443, unit: 'per 100K', change: -8.2, trend: 'down', icon: 'Heart', color: '#EF4444', sparkline: [510,498,485,475,468,460,455,450,448,445,443], target: 300 },
  { id: 'tpr', title: 'Teenage Pregnancy Rate', value: 28.6, unit: '%', change: -3.1, trend: 'down', icon: 'Baby', color: '#F59E0B', sparkline: [34,33,32.5,31.8,31,30.2,29.8,29.5,29,28.8,28.6], target: 20 },
  { id: 'cpu', title: 'Contraceptive Usage', value: 21.3, unit: '%', change: 4.7, trend: 'up', icon: 'Shield', color: '#10B981', sparkline: [15,16,16.5,17,17.8,18.5,19,19.8,20.2,20.8,21.3], target: 35 },
  { id: 'hfc', title: 'Health Facility Coverage', value: 67.4, unit: '%', change: 2.8, trend: 'up', icon: 'Building2', color: '#06B6D4', sparkline: [58,59,60,61,62.5,63,64,65,65.8,66.5,67.4], target: 85 },
  { id: 'anc', title: 'ANC 4+ Visits', value: 58.2, unit: '%', change: 5.3, trend: 'up', icon: 'Stethoscope', color: '#8B5CF6', sparkline: [45,47,48,49,51,52,54,55,56.5,57,58.2], target: 75 },
  { id: 'sba', title: 'Skilled Birth Attendance', value: 87.1, unit: '%', change: 1.9, trend: 'up', icon: 'UserCheck', color: '#14B8A6', sparkline: [78,79.5,80,81,82,83,84,85,85.8,86.5,87.1], target: 95 },
  { id: 'gbv', title: 'GBV Reports', value: 1247, unit: 'cases', change: 12.4, trend: 'up', icon: 'AlertTriangle', color: '#EF4444', sparkline: [980,1010,1035,1060,1080,1100,1130,1160,1190,1220,1247], target: null },
  { id: 'rht', title: 'Districts On-Track', value: 11, unit: 'of 16', change: 2, trend: 'up', icon: 'MapPin', color: '#10B981', sparkline: [6,6,7,7,8,8,9,9,10,10,11], target: 16 },
];

export const burnRateData = {
  totalFunds: 60000000,
  totalDispensed: 59100000,
  totalUnspent: 923500,
  burnRates: {
    y2023: 97.83,
    y2024: 101.62,
    y2025: 97.20,
    total: 98.46
  },
  monthlyBurn: [
    { month:'Jan',operational:380,procurement:290 },{ month:'Feb',operational:420,procurement:310 },
    { month:'Mar',operational:395,procurement:340 },{ month:'Apr',operational:450,procurement:360 },
    { month:'May',operational:410,procurement:330 },{ month:'Jun',operational:470,procurement:380 },
    { month:'Jul',operational:430,procurement:350 },{ month:'Aug',operational:460,procurement:370 },
    { month:'Sep',operational:440,procurement:360 },{ month:'Oct',operational:480,procurement:390 },
    { month:'Nov',operational:455,procurement:375 },{ month:'Dec',operational:490,procurement:400 },
  ],
};

export const fundFlowData = [
  { date: '2023-03-30', amount: 5000000 },
  { date: '2023-08-09', amount: 5000000 },
  { date: '2023-11-06', amount: 5000000 },
  { date: '2024-06-18', amount: 7500000 },
  { date: '2024-10-18', amount: 7500000 },
  { date: '2025-11-03', amount: 15000000 },
  { date: '24/07/2025', amount: 15000000 }
];

export const procurementData = [
  { id:1, entity:'SLeSHI', item:'Request for fund for production and printing of prescription forms', requestedBy:'Director/C.E.O/Executive Director', submittedDate:'Jun 28, 2024', estCompletion:null, amountReq:85000, status:'pending', objective:'Obj4' },
  { id:2, entity:'SLeSHI', item:'Review of health benefits package', requestedBy:'Director/C.E.O/Executive Director', submittedDate:'Jul 6, 2023', estCompletion:'Nov 6, 2023', amountReq:120000, status:'complete', objective:'Obj4' },
  { id:3, entity:'SLeSHI', item:'Laptops, Printer, Safe', requestedBy:'Director/C.E.O/Executive Director', submittedDate:'Jun 13, 2023', estCompletion:'Jun 13, 2023', amountReq:45000, status:'complete', objective:'Obj4' },
  { id:4, entity:'SLeSHI', item:'Consultant for operationalising SLeSHI', requestedBy:'Director/C.E.O/Executive Director', submittedDate:'Jul 6, 2023', estCompletion:'Nov 6, 2023', amountReq:95000, status:'complete', objective:'Obj4' },
  { id:5, entity:'SLeSHI', item:'Consultant for comms strategy', requestedBy:'Director/C.E.O/Executive Director', submittedDate:'Jul 6, 2023', estCompletion:'Nov 6, 2023', amountReq:72000, status:'ongoing', objective:'Obj4' },
  { id:6, entity:'RCH', item:'Procurement of family planning commodities', requestedBy:'Director RCH', submittedDate:'Jan 15, 2024', estCompletion:'Feb 28, 2024', amountReq:450000, status:'complete', objective:'Obj6' },
  { id:7, entity:'RCH', item:'EmONC training equipment', requestedBy:'Director RCH', submittedDate:'Mar 1, 2024', estCompletion:'Jun 30, 2024', amountReq:180000, status:'ongoing', objective:'Obj5' },
  { id:8, entity:'PHC', item:'Rehabilitation of 20 health facilities', requestedBy:'Director PHC', submittedDate:'Feb 15, 2024', estCompletion:'Sep 30, 2024', amountReq:620000, status:'ongoing', objective:'Obj5' },
  { id:9, entity:'PHC', item:'Community health worker kits', requestedBy:'Director PHC', submittedDate:'Jan 20, 2024', estCompletion:'Mar 31, 2024', amountReq:95000, status:'complete', objective:'Obj3' },
  { id:10, entity:'NEMS', item:'Procurement of 5 ambulances', requestedBy:'Director NEMS', submittedDate:'Mar 10, 2024', estCompletion:'Aug 31, 2024', amountReq:350000, status:'ongoing', objective:'Obj5' },
  { id:11, entity:'NMSA', item:'Contraceptive supply chain optimization', requestedBy:'Director NMSA', submittedDate:'Jan 5, 2024', estCompletion:'Mar 31, 2024', amountReq:210000, status:'complete', objective:'Obj6' },
  { id:12, entity:'NMSA', item:'Warehouse management system upgrade', requestedBy:'Director NMSA', submittedDate:'Feb 10, 2024', estCompletion:'May 31, 2024', amountReq:175000, status:'complete', objective:'Obj6' },
  { id:13, entity:'COMAHS', item:'Simulation lab equipment', requestedBy:'Principal COMAHS', submittedDate:'Feb 1, 2024', estCompletion:'Apr 30, 2024', amountReq:280000, status:'overdue', objective:'Obj3' },
  { id:14, entity:'Gender', item:'GBV one-stop center establishment', requestedBy:'Director Gender', submittedDate:'Mar 15, 2024', estCompletion:'Jul 31, 2024', amountReq:195000, status:'ongoing', objective:'Obj1' },
];

// Entity deep-dive data for Milestone Tracking
export const entityDeepDive = {
  sleshi: {
    objectives: [
      { id:'Obj4', name:'Strengthen and institutionalise sustainable health financing through SLeSHI', status:'ongoing', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'% of population enrolled in SLeSHI', type:'Outcome', target:15, actual:8.2, year:'2024', status:'behind' },
      { id:2, name:'Number of health facilities contracted', type:'Output', target:200, actual:145, year:'2024', status:'on-track' },
      { id:3, name:'Claims processing turnaround (days)', type:'Process', target:14, actual:18, year:'2024', status:'behind' },
      { id:4, name:'Provider payment completion rate (%)', type:'Output', target:90, actual:82, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'Review of health benefits package', actual:'Completed review with 12 stakeholders', api:'Benefits package finalized', status:'complete' },
      { activity:'Operationalisation of SLeSHI', actual:'3 of 5 districts operational', api:'5 districts fully operational', status:'ongoing' },
      { activity:'Communications strategy development', actual:'Draft strategy produced', api:'Strategy approved by board', status:'ongoing' },
      { activity:'IT systems procurement', actual:'Vendor selected', api:'System deployed in 3 districts', status:'behind' },
    ]
  },
  phc: {
    objectives: [
      { id:'Obj5', name:'Expand integrated SRH service infrastructure and referral systems', status:'ongoing', year:'2023-2025' },
      { id:'Obj3', name:'Increase the number and quality of health professionals', status:'on-track', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'Number of facilities rehabilitated', type:'Output', target:20, actual:14, year:'2024', status:'on-track' },
      { id:2, name:'CHW deployment rate (%)', type:'Output', target:100, actual:92, year:'2024', status:'on-track' },
      { id:3, name:'Outreach services coverage (%)', type:'Outcome', target:80, actual:68, year:'2024', status:'on-track' },
      { id:4, name:'Patient satisfaction score (%)', type:'Outcome', target:85, actual:78, year:'2024', status:'on-track' },
      { id:5, name:'Referral completion rate (%)', type:'Process', target:90, actual:75, year:'2024', status:'behind' },
    ],
    activities: [
      { activity:'Community health worker deployment', actual:'1,100 CHWs deployed in 12 districts', api:'1,200 CHWs in all 16 districts', status:'on-track' },
      { activity:'Rehabilitation of health facilities', actual:'14 of 20 facilities completed', api:'20 facilities rehabilitated', status:'ongoing' },
      { activity:'Integrated outreach services', actual:'8 districts covered', api:'12 districts covered', status:'on-track' },
      { activity:'Referral pathway establishment', actual:'Protocols developed for 10 districts', api:'All 16 districts', status:'behind' },
    ]
  },
  rch: {
    objectives: [
      { id:'Obj5', name:'Expand integrated SRH service infrastructure', status:'ongoing', year:'2023-2025' },
      { id:'Obj6', name:'Ensure uninterrupted supply of SRH commodities', status:'on-track', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'Modern contraceptive prevalence rate (%)', type:'Outcome', target:25, actual:21.3, year:'2024', status:'on-track' },
      { id:2, name:'EmONC facilities operational (%)', type:'Output', target:80, actual:65, year:'2024', status:'behind' },
      { id:3, name:'ANC 4+ coverage (%)', type:'Outcome', target:65, actual:58.2, year:'2024', status:'on-track' },
      { id:4, name:'Skilled birth attendance (%)', type:'Outcome', target:90, actual:87.1, year:'2024', status:'on-track' },
      { id:5, name:'Midwives trained on comprehensive ANC', type:'Output', target:500, actual:380, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'EmONC assessment in 16 districts', actual:'Assessment completed in all 16', api:'Assessment report finalized', status:'complete' },
      { activity:'Family planning commodity procurement', actual:'Procured and distributed', api:'100% stockout-free facilities', status:'complete' },
      { activity:'Midwife training on comprehensive ANC', actual:'380 of 500 trained', api:'500 midwives trained', status:'ongoing' },
      { activity:'Adolescent SRH program rollout', actual:'Piloted in 5 districts', api:'Rollout in 10 districts', status:'ongoing' },
    ]
  },
  dppi: {
    objectives: [
      { id:'Obj7', name:'Improve SRHR program leadership and governance', status:'on-track', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'DHIS2 reporting completeness (%)', type:'Process', target:95, actual:91, year:'2024', status:'on-track' },
      { id:2, name:'District M&E officers trained', type:'Output', target:32, actual:30, year:'2024', status:'on-track' },
      { id:3, name:'Data quality score (%)', type:'Process', target:90, actual:85, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'National SRHR dashboard deployment', actual:'Dashboard live and operational', api:'Dashboard with real-time data', status:'complete' },
      { activity:'District-level M&E training', actual:'30 of 32 officers trained', api:'All 32 officers trained', status:'on-track' },
      { activity:'Quarterly review meetings', actual:'4 of 4 conducted', api:'4 quarterly reviews', status:'complete' },
    ]
  },
  nems: {
    objectives: [
      { id:'Obj5', name:'Expand integrated SRH service infrastructure', status:'ongoing', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'Ambulance response time (minutes)', type:'Outcome', target:30, actual:45, year:'2024', status:'behind' },
      { id:2, name:'Emergency referrals completed', type:'Output', target:2000, actual:1650, year:'2024', status:'on-track' },
      { id:3, name:'Emergency protocol districts', type:'Output', target:16, actual:12, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'Procurement of 5 ambulances', actual:'2 delivered, 3 pending', api:'5 ambulances operational', status:'ongoing' },
      { activity:'Emergency referral protocol development', actual:'Protocol finalized', api:'Protocol implemented nationally', status:'complete' },
      { activity:'Paramedic training program', actual:'45 paramedics trained', api:'80 paramedics trained', status:'behind' },
    ]
  },
  gender: {
    objectives: [
      { id:'Obj1', name:'Create awareness and generate evidence to address GBV', status:'ongoing', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'GBV one-stop centers established', type:'Output', target:8, actual:5, year:'2024', status:'on-track' },
      { id:2, name:'GBV survivors receiving support (%)', type:'Outcome', target:70, actual:58, year:'2024', status:'behind' },
      { id:3, name:'Districts with GBV data system', type:'Output', target:16, actual:12, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'GBV one-stop center establishment', actual:'5 of 8 centers established', api:'8 centers operational', status:'ongoing' },
      { activity:'GBV data collection system rollout', actual:'12 districts covered', api:'All 16 districts', status:'on-track' },
      { activity:'Community awareness campaigns', actual:'8 campaigns conducted', api:'16 campaigns (1 per district)', status:'ongoing' },
    ]
  },
  nmsa: {
    objectives: [
      { id:'Obj6', name:'Ensure uninterrupted supply and availability of SRH commodities', status:'on-track', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'Stockout rate for key commodities (%)', type:'Outcome', target:5, actual:8, year:'2024', status:'behind' },
      { id:2, name:'Last-mile delivery efficiency (%)', type:'Process', target:90, actual:82, year:'2024', status:'on-track' },
      { id:3, name:'Warehouse utilization rate (%)', type:'Process', target:85, actual:88, year:'2024', status:'achieved' },
      { id:4, name:'Commodity wastage rate (%)', type:'Outcome', target:10, actual:12, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'Contraceptive supply chain optimization', actual:'Optimized in 12 districts', api:'All 16 districts optimized', status:'on-track' },
      { activity:'Warehouse management system upgrade', actual:'System deployed and live', api:'System in all warehouses', status:'complete' },
      { activity:'Last-mile delivery improvement', actual:'New routes in 10 districts', api:'All districts covered', status:'ongoing' },
    ]
  },
  donor_coord: {
    objectives: [
      { id:'Obj7', name:'Improve SRHR program leadership and governance', status:'on-track', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'Quarterly reports submitted on time', type:'Process', target:4, actual:4, year:'2024', status:'achieved' },
      { id:2, name:'Donor meetings conducted', type:'Output', target:6, actual:5, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'Quarterly donor report submission', actual:'All 4 submitted on time', api:'4 quarterly reports', status:'complete' },
      { activity:'Annual program review meeting', actual:'Meeting held successfully', api:'Annual review completed', status:'complete' },
      { activity:'Partner coordination meetings', actual:'5 of 6 meetings held', api:'6 partner meetings', status:'on-track' },
    ]
  },
  comahs: {
    objectives: [
      { id:'Obj3', name:'Increase the number and quality of health professionals', status:'ongoing', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'Midwifery graduates per year', type:'Output', target:150, actual:120, year:'2024', status:'on-track' },
      { id:2, name:'Curriculum modules updated', type:'Output', target:8, actual:5, year:'2024', status:'behind' },
      { id:3, name:'Simulation lab utilization (%)', type:'Process', target:80, actual:45, year:'2024', status:'behind' },
    ],
    activities: [
      { activity:'Curriculum review for midwifery', actual:'5 of 8 modules reviewed', api:'All 8 modules updated', status:'ongoing' },
      { activity:'Simulation lab equipment procurement', actual:'Equipment ordered, delayed', api:'Lab fully equipped', status:'overdue' },
      { activity:'Faculty development program', actual:'12 faculty trained', api:'20 faculty trained', status:'on-track' },
    ]
  },
  postgraduate: {
    objectives: [
      { id:'Obj3', name:'Increase the number and quality of health professionals', status:'on-track', year:'2023-2025' }
    ],
    kpis: [
      { id:1, name:'Specialist trainees enrolled', type:'Output', target:30, actual:25, year:'2024', status:'on-track' },
      { id:2, name:'Training program completion rate (%)', type:'Outcome', target:85, actual:80, year:'2024', status:'on-track' },
    ],
    activities: [
      { activity:'Specialist training program launch', actual:'Program launched with 25 trainees', api:'30 trainees enrolled', status:'on-track' },
      { activity:'Clinical rotation agreements', actual:'4 of 5 hospitals signed', api:'5 hospital agreements', status:'on-track' },
    ]
  },
};

export const aiInsights = [
  { id:1,type:'critical',title:'Maternal Mortality Spike — Falaba District',description:'AI models predict a 23% increase in maternal deaths in Falaba District.',recommendation:'Deploy 3 additional midwives.',confidence:94,priority:'urgent',timestamp:'2 hours ago',icon:'AlertTriangle' },
  { id:2,type:'warning',title:'Teenage Pregnancy Cluster — Karene & Koinadugu',description:'Adolescent pregnancy rates significantly exceed national average.',recommendation:'Activate community health education.',confidence:87,priority:'high',timestamp:'5 hours ago',icon:'TrendingUp' },
  { id:3,type:'info',title:'Contraceptive Uptake Success — Western Area',description:'Western Area Urban shows 32.5% contraceptive usage, exceeding Q4 target.',recommendation:'Replicate supply chain model.',confidence:91,priority:'medium',timestamp:'8 hours ago',icon:'CheckCircle' },
  { id:4,type:'warning',title:'GBV Case Surge — National Alert',description:'GBV reports increased by 12.4% this quarter.',recommendation:'Strengthen one-stop centers.',confidence:82,priority:'high',timestamp:'12 hours ago',icon:'Shield' },
];
