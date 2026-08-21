import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.resolve(__dirname, '../../../ctos-beta-firebase-adminsdk-fbsvc-c5f3f51d3f.json');
let serviceAccount;
if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = require(serviceAccountPath);
} else {
  console.warn('[Firebase] Warning: service account file not found:', serviceAccountPath);
  serviceAccount = {}; // Provide a dummy or handle missing gracefully if possible
}

const app = initializeApp({
  credential: Object.keys(serviceAccount).length > 0 ? cert(serviceAccount) : undefined,
  databaseURL: "https://ctos-beta-default-rtdb.firebaseio.com"
});

export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
