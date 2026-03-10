const express = require('express');
const router = express.Router();

const { 
  updateMenu, 
  getHeadcount, 
  getRefundLedger, 
  updateNotice, 
  getNotice,
  getAllStudents,
  toggleBlockStatus
} = require('../controllers/adminController');

router.post('/menu', updateMenu);
router.get('/headcount', getHeadcount);
router.get('/ledger', getRefundLedger);


router.post('/notice', updateNotice); 
router.get('/notice', getNotice);     

// Admin saare students ko dekh sake
router.get('/students', getAllStudents);
// Admin kisi student ka block status change kar sake
router.post('/students/block', toggleBlockStatus);
module.exports = router;