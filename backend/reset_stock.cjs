const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../ctos-beta-firebase-adminsdk-fbsvc-c5f3f51d3f.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function resetStock() {
  const stockRef = db.collection('stock');
  const snapshot = await stockRef.get();

  if (snapshot.empty) {
    console.log('No stock documents found.');
    return;
  }

  let batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    batch.update(doc.ref, { quantity: 0 });
    count++;

    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
      console.log(`Updated ${count} stock items...`);
    }
  }

  if (count % 400 !== 0) {
    await batch.commit();
  }

  console.log(`Successfully reset ${count} stock items to 0.`);
}

resetStock().then(() => {
  process.exit(0);
}).catch(console.error);
