import { Router } from 'express';
import { getStaff } from '../controllers/staffController';
import { syncSkyTvSchedule } from '../services/skyTvScraper';
import { fetchStockFromSheets, syncStockToSheets } from '../services/googleSheets';

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

// Stock & Sheets Routes
router.get('/stock', async (req, res) => {
    try {
        const stock = await fetchStockFromSheets();
        if (!stock) {
            return res.status(404).json({ success: false, error: 'Google Sheets not configured or Stock sheet missing' });
        }
        res.json({ success: true, data: stock });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/stock/sync', async (req, res) => {
    try {
        const { stockItems } = req.body;
        if (!stockItems || !Array.isArray(stockItems)) {
            return res.status(400).json({ success: false, error: 'Invalid stockItems format' });
        }
        await syncStockToSheets(stockItems);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
