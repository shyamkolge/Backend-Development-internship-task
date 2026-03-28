const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

// All admin routes require a valid JWT and admin role.
router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
