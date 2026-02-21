import express from 'express';
import { createFuelLog, getFuelLogs, getOperationalCost } from '../controllers/fuelController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getFuelLogs)
  .post(protect, authorize('Financial Analyst', 'Fleet Manager', 'Dispatcher'), createFuelLog);

router.get('/cost/:vehicleId', protect, getOperationalCost);

export default router;
