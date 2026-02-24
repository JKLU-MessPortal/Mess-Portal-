const express = require('express');
const router = express.Router();
const { updateMenu, getHeadcount } = require('../controllers/adminController');

router.post('/update-menu', updateMenu);
router.get('/headcount', getHeadcount); // <-- The new analytics route

module.exports = router;