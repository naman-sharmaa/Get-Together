import express from 'express';
import { adminLogin, createAdmin, getCurrentAdmin } from '../controllers/adminAuthController.js';
import {
  getDashboardOverview,
  getOrganizerAnalytics,
  getAllOrganizers,
  getRevenueTrends,
} from '../controllers/adminAnalyticsController.js';
import {
  getSystemSettings,
  updateSystemSettings,
  toggleMaintenanceMode,
} from '../controllers/systemSettingsController.js';
import {
  getAllPayouts,
  calculatePendingPayout,
  createPayout,
  updatePayoutStatus,
  generateBulkPayouts,
} from '../controllers/payoutController.js';
import {
  getAllUsers,
  getUserStats,
} from '../controllers/adminUserController.js';
import {
  requestPasswordChangeOTP,
  changePasswordWithOTP,
} from '../controllers/adminPasswordController.js';
import { authenticateAdmin, checkPermission } from '../middleware/adminAuth.js';

const router = express.Router();

// Public admin routes (no authentication required)
router.post('/login', adminLogin);

// Protected admin routes (authentication required)
router.use(authenticateAdmin); // Check admin JWT and validate admin user

// Admin profile
router.get('/me', getCurrentAdmin);

// Admin management (super-admin only)
router.post('/create-admin', checkPermission('canManageUsers'), createAdmin);

// Analytics routes
router.get('/analytics/dashboard', checkPermission('canViewAnalytics'), getDashboardOverview);
router.get('/analytics/organizers', checkPermission('canViewAnalytics'), getAllOrganizers);
router.get('/analytics/organizers/:organizerId', checkPermission('canViewAnalytics'), getOrganizerAnalytics);
router.get('/analytics/revenue-trends', checkPermission('canViewAnalytics'), getRevenueTrends);

// System settings routes
router.get('/settings', getSystemSettings);
router.put('/settings', checkPermission('canToggleMaintenance'), updateSystemSettings);
router.post('/settings/maintenance', checkPermission('canToggleMaintenance'), toggleMaintenanceMode);

// Payout routes
router.get('/payouts', checkPermission('canManagePayouts'), getAllPayouts);
router.get('/payouts/calculate/:organizerId', checkPermission('canManagePayouts'), calculatePendingPayout);
router.post('/payouts', checkPermission('canManagePayouts'), createPayout);
router.put('/payouts/:payoutId/status', checkPermission('canManagePayouts'), updatePayoutStatus);
router.post('/payouts/bulk', checkPermission('canManagePayouts'), generateBulkPayouts);

// User management routes
router.get('/users', checkPermission('canManageUsers'), getAllUsers);
router.get('/users/stats', checkPermission('canManageUsers'), getUserStats);

// Admin password change routes
router.post('/password/request-otp', requestPasswordChangeOTP);
router.post('/password/change', changePasswordWithOTP);

export default router;
