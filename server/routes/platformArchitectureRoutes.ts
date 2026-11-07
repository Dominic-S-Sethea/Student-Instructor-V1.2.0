import { Router } from 'express';
import { platformArchitectureController } from '../controllers/platformArchitectureController';

const router = Router();

// Platform Architecture & Topology (Task 1 & Task 4)
router.get('/architecture', (req, res) => platformArchitectureController.getArchitecture(req, res));

// Mobile Application Multi-Role & Device Sync (Task 2 & Task 3)
router.get('/mobile/roles', (req, res) => platformArchitectureController.getMobileRoles(req, res));
router.post('/mobile/devices', (req, res) => platformArchitectureController.registerDevice(req, res));
router.post('/mobile/sync', (req, res) => platformArchitectureController.syncOfflineQueue(req, res));

// Child Safety, Content Moderation & Parental Governance (Task 5 & Task 6)
router.post('/child-safety/scan', (req, res) => platformArchitectureController.scanContentForSafety(req, res));
router.get('/security/audit-logs', (req, res) => platformArchitectureController.getAuditLogs(req, res));

// Notifications System (Task 8)
router.post('/notifications/dispatch', (req, res) => platformArchitectureController.dispatchNotification(req, res));

// Admin Ecosystem Portals (Task 7)
router.get('/admin/ecosystem', (req, res) => platformArchitectureController.getAdminEcosystem(req, res));

// APM & Real-Time SRE Monitoring (Task 9)
router.get('/monitoring/metrics', (req, res) => platformArchitectureController.getMonitoringMetrics(req, res));

export default router;
