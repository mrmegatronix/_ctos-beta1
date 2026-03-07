import * as admin from 'firebase-admin';
import path from 'path';

// Path to the service account key located in the root directory relative to the backend build output or src.
// Going one level up from `backend` reaches the project root.
const serviceAccountPath = path.resolve(__dirname, '../../../ctos-beta-firebase-adminsdk-fbsvc-c5f3f51d3f.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ctos-beta-default-rtdb.firebaseio.com"
});

export const db = admin.firestore();
export const rtdb = admin.database();
export default admin;
