const express = require('express');
const router = express.Router();

// 🚨 YAHAN FIX KIYA HAI: updateNotice aur getNotice ko import kiya
const { 
  updateMenu, 
  getHeadcount, 
  getRefundLedger, 
  updateNotice, 
  getNotice 
} = require('../controllers/adminController');

// Purane Routes
router.post('/menu', updateMenu);
router.get('/headcount', getHeadcount);
router.get('/ledger', getRefundLedger);

// Naye Notice Routes
router.post('/notice', updateNotice); 
router.get('/notice', getNotice);     

module.exports = router;