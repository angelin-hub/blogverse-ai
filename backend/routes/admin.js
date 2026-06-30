const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUserRole } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/stats',              getDashboardStats);
router.get('/users',              getUsers);
router.put('/users/:id/role',     updateUserRole);

module.exports = router;
