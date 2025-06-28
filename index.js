const admin = require('firebase-admin');
console.log('FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT);

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./service-account.json');
}
console.log('Service Account Source:', serviceAccount);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (err) {
  console.error('Firebase initialization error:', err);
}

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Enable file upload middleware
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import the PDF controller
const { uploadPdf } = require('./controllers/pdfController');

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Route for PDF upload
app.post('/upload-pdf', uploadPdf);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port', process.env.PORT || 3000);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});