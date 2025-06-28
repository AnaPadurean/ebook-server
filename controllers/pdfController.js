const { exec } = require('child_process');
const util = require('util');
const admin = require('firebase-admin');

// Promisify exec for async/await
const execPromise = util.promisify(exec);

// General description for all books
const GENERAL_DESCRIPTION = 'A unique book uploaded by the user, ready for exploration';

// Function to process and validate PDF
async function uploadPdf(req, res) {
  try {
    // Placeholder for PDF file or URL from request
    const pdfUrl = req.body.pdfUrl; // Assume Android app sends Firebase Storage URL
    if (!pdfUrl) {
      return res.status(400).json({ error: 'No PDF URL provided' });
    }

    // Download PDF from Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(pdfUrl.replace('gs://' + bucket.name + '/', ''));
    const tempFilePath = `/tmp/${Date.now()}.pdf`;
    await file.download({ destination: tempFilePath });

    // Run PDFBox to extract text (example command, adjust path to JAR)
    const pdfBoxCommand = `java -jar pdfbox-app-3.0.0.jar ExtractText ${tempFilePath}`;
    const { stdout } = await execPromise(pdfBoxCommand);

    // Basic validation: Check for minimum text
    const wordCount = stdout.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 50) {
      return res.status(400).json({ error: 'PDF does not contain enough text to be considered a book' });
    }

    // Extract title (first non-empty line or file name as fallback)
    const lines = stdout.split('\n').filter(line => line.trim().length > 0);
    const title = lines.length > 0 ? lines[0].substring(0, 100) : pdfUrl.split('/').pop().replace('.pdf', '');

    // Store metadata in Firestore
    const db = admin.firestore();
    const bookId = pdfUrl.split('/').pop();
    await db.collection('books').doc(bookId).set({
      title: title,
      description: GENERAL_DESCRIPTION,
      userId: req.body.userId || 'unknown', // Assume userId is sent from app
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Clean up temporary file
    await execPromise(`rm ${tempFilePath}`);

    res.json({ message: 'PDF validated and stored', title: title, bookId: bookId });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
}

module.exports = { uploadPdf };