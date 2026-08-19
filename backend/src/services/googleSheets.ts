import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

let doc: GoogleSpreadsheet | null = null;

export const initGoogleSheets = async () => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const credsPath = path.join(__dirname, '../../google-credentials.json');

    if (!sheetId) {
      console.warn('[Google Sheets] GOOGLE_SHEET_ID is not set in .env. Skipping Sheets integration.');
      return false;
    }

    if (!fs.existsSync(credsPath)) {
      console.warn(`[Google Sheets] Credentials file not found at ${credsPath}. Please place your JSON key there.`);
      return false;
    }

    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

    const auth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();
    console.log(`[Google Sheets] Connected successfully to document: ${doc.title}`);
    
    return true;
  } catch (error) {
    console.error('[Google Sheets] Failed to initialize:', error);
    return false;
  }
};

export const syncStockToSheets = async (stockItems: any[]) => {
  if (!doc) return;

  try {
    let sheet = doc.sheetsByTitle['Stock'];
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'Stock', headerValues: ['id', 'name', 'category', 'quantity', 'price', 'cost', 'supplierId', 'barcode', 'location'] });
    }

    await sheet.clearRows();

    const rows = stockItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      cost: item.cost,
      supplierId: item.supplierId || '',
      barcode: item.barcode || '',
      location: item.location || ''
    }));

    await sheet.addRows(rows);
    console.log('[Google Sheets] Stock synced to sheets successfully.');
  } catch (error) {
    console.error('[Google Sheets] Error syncing stock:', error);
  }
};

export const fetchStockFromSheets = async () => {
  if (!doc) return null;

  try {
    const sheet = doc.sheetsByTitle['Stock'];
    if (!sheet) return null;

    const rows = await sheet.getRows();
    const items = rows.map(row => ({
      id: row.get('id'),
      name: row.get('name'),
      category: row.get('category'),
      quantity: parseInt(row.get('quantity') || '0'),
      price: parseFloat(row.get('price') || '0'),
      cost: parseFloat(row.get('cost') || '0'),
      supplierId: row.get('supplierId'),
      barcode: row.get('barcode'),
      location: row.get('location')
    }));

    return items;
  } catch (error) {
    console.error('[Google Sheets] Error fetching stock:', error);
    return null;
  }
};
