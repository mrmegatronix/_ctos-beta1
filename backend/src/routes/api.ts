import { Router } from 'express';
import { getStaff } from '../controllers/staffController';

import { syncSkyTvSchedule } from '../services/skyTvScraper';

const router = Router();

// Staff Routes
router.get('/staff', getStaff);

// Sky TV Sync Route
router.get('/sync-sky', async (req, res) => {
    try {
        const result = await syncSkyTvSchedule();
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
