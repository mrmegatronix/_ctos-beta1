const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'ctos_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB schema
const DEFAULT_DB = {
  stockItems: [],
  suppliers: [],
  purchaseOrders: [],
  stocktakes: [],
  recipes: [],
  teamMembers: [],
  timesheets: [],
  timePunches: [],
  rosterShifts: [],
  eodSales: [],
  detailedCashups: [],
  cashups: [],
  invoices: [],
  wastage: [],
  menus: [],
  bookings: [],
  calendarEvents: [],
  budgetTrackers: []
};

// Safe load database
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return { ...DEFAULT_DB, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('[DB] Error loading DB, using fallback defaults:', err.message);
  }
  return { ...DEFAULT_DB };
}

// Atomic save database
function saveDb(db) {
  const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Initialize file if not exists
if (!fs.existsSync(DB_FILE)) {
  saveDb(DEFAULT_DB);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Collection: GET all
app.get('/api/db/:collection', (req, res) => {
  try {
    const { collection } = req.params;
    const db = loadDb();
    const items = db[collection] || [];
    res.json({ success: true, collection, data: items, count: items.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Collection: POST (upsert one or many)
app.post('/api/db/:collection', (req, res) => {
  try {
    const { collection } = req.params;
    const payload = req.body;
    const db = loadDb();
    if (!db[collection]) {
      db[collection] = [];
    }

    const itemsToUpsert = Array.isArray(payload) ? payload : [payload];
    for (const item of itemsToUpsert) {
      if (!item || !item.id) continue;
      const index = db[collection].findIndex(existing => existing.id === item.id);
      if (index >= 0) {
        db[collection][index] = { ...db[collection][index], ...item };
      } else {
        db[collection].push(item);
      }
    }

    saveDb(db);
    res.json({ success: true, collection, upsertedCount: itemsToUpsert.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Collection: DELETE by id
app.delete('/api/db/:collection/:id', (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = loadDb();
    if (db[collection]) {
      db[collection] = db[collection].filter(item => item.id !== id);
      saveDb(db);
    }
    res.json({ success: true, collection, deletedId: id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POS Webhook: Tevalis POS EOD/Live sales ingestion
app.post('/api/pos/webhook', (req, res) => {
  try {
    const salesRecord = req.body;
    if (!salesRecord || !salesRecord.itemsSold) {
      return res.status(400).json({ success: false, error: 'Invalid sales record format' });
    }

    const db = loadDb();
    if (!db.eodSales) db.eodSales = [];
    if (!salesRecord.id) {
      salesRecord.id = `eod-${Date.now()}`;
    }
    db.eodSales.push(salesRecord);
    saveDb(db);

    console.log(`[POS-WEBHOOK] Ingested sales record: ${salesRecord.id} with ${salesRecord.itemsSold.length} items`);
    res.json({ success: true, id: salesRecord.id, count: salesRecord.itemsSold.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Backward compatibility: /api/stock
app.get('/api/stock', (req, res) => {
  const db = loadDb();
  res.json({ success: true, data: db.stockItems || [] });
});

app.post('/api/stock/sync', (req, res) => {
  try {
    const { stockItems } = req.body;
    if (!stockItems || !Array.isArray(stockItems)) {
      return res.status(400).json({ success: false, error: 'Invalid stockItems format' });
    }
    const db = loadDb();
    db.stockItems = stockItems;
    saveDb(db);
    res.json({ success: true, count: stockItems.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CTOS-BACKEND] Atomic JSON server running on http://0.0.0.0:${PORT}`);
});
