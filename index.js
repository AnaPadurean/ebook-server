const admin = require('firebase-admin');
console.log('FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT);

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); // Parse doar variabila de mediu
} else {
  serviceAccount = require('./service-account.json'); // Folosește direct obiectul de la require
}
console.log('Service Account Source:', serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log('Firebase Admin SDK initialized successfully');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port', process.env.PORT || 3000);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});