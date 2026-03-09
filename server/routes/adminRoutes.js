const express = require('express');
const router = express.Router();

const { 
  updateMenu, 
  getHeadcount, 
  getRefundLedger, 
  updateNotice, 
  getNotice 
} = require('../controllers/adminController');

router.post('/menu', updateMenu);
router.get('/headcount', getHeadcount);
router.get('/ledger', getRefundLedger);


router.post('/notice', updateNotice); 
router.get('/notice', getNotice);     

module.exports = router;