import { Router } from 'express';
import { platformArchitectureController } from '../controllers/platformArchitectureController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  PlatformDeviceSchema,
  PlatformSyncSchema,
  SafetyScanSchema,
  NotificationDispatchSchema,
} from '../validators/apiSchemas';

const router = Router();

// Public platform architecture summary
router.get('/architecture', (req, res) => platformArchitectureController.getArchitecture(req, res));

// Authenticated mobile & safety scanning endpoints
router.get('/mobile/roles', authenticateToken, (req, res) => platformArchitectureController.getMobileRoles(req, res));
router.post('/mobile/devices', authenticateToken, validate(PlatformDeviceSchema, 'body'), (req, res) => platformArchitectureController.registerDevice(req, res));
router.post('/mobile/sync', authenticateToken, validate(PlatformSyncSchema, 'body'), (req, res) => platformArchitectureController.syncOfflineQueue(req, res));
router.post('/child-safety/scan', authenticateToken, validate(SafetyScanSchema, 'body'), (req, res) => platformArchitectureController.scanContentForSafety(req, res));

// Admin-only security logs, notifications, ecosystem portals, and SRE monitoring
router.get('/security/audit-logs', authenticateToken, requireRole('admin'), (req, res) => platformArchitectureController.getAuditLogs(req, res));
router.post('/notifications/dispatch', authenticateToken, requireRole('admin'), validate(NotificationDispatchSchema, 'body'), (req, res) => platformArchitectureController.dispatchNotification(req, res));
router.get('/admin/ecosystem', authenticateToken, requireRole('admin'), (req, res) => platformArchitectureController.getAdminEcosystem(req, res));
router.get('/monitoring/metrics', authenticateToken, requireRole('admin'), (req, res) => platformArchitectureController.getMonitoringMetrics(req, res));

export default router;
