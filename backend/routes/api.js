const express = require('express');
const router = express.Router();
const c = require('../controllers/dashboardController');

router.get('/meta',                 c.getMeta);

router.get('/kpis/national',        c.getNationalKpis);

router.get('/entities',             c.getEntities);
router.get('/entities/:id',         c.getEntity);

router.get('/objectives',           c.getObjectives);
router.get('/objectives/:id',       c.getObjective);

router.get('/finance',              c.getFinance);
router.get('/procurement',          c.getProcurement);
router.get('/operational',          c.getOperational);
router.get('/rmnch',                c.getRmnch);
router.get('/milestones',           c.getMilestones);

// Legacy / convenience endpoints
router.get('/dashboard/overview',   c.getOverview);
router.get('/districts',            c.getDistricts);
router.get('/kpis',                 c.getNationalKpis);

module.exports = router;
