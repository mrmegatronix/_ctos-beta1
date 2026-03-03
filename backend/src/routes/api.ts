import { Router } from 'express';
import { getStaff } from '../controllers/staffController';

const router = Router();

// Staff Routes
router.get('/staff', getStaff);

// Add more routes as needed...
// router.get('/events', getEvents);
// router.get('/shifts', getShifts);

export default router;
