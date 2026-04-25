const express = require('express');
const router = express.Router();

const { 
  updateMenu, 
  getHeadcount, 
  getRefundLedger, 
  updateNotice, 
  getNotice,
  getAllStudents,
  toggleBlockStatus,
  getHostellers,
  registerHosteller,
  deregisterHosteller,
  updateUserRole,
} = require('../controllers/adminController');

router.post('/menu', updateMenu);
router.get('/headcount', getHeadcount);
router.get('/ledger', getRefundLedger);

router.post('/notice', updateNotice); 
router.get('/notice', getNotice);     

// Student list & block management
router.get('/students', getAllStudents);
router.post('/students/block', toggleBlockStatus);

// Hosteller Registry
router.get('/hostellers', getHostellers);
router.post('/hostellers/register', registerHosteller);
router.delete('/hostellers/deregister', deregisterHosteller);

// User Role Management
router.put('/users/role', updateUserRole);

module.exports = router;