import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/upload.js'; // your existing router



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Mount your upload router
app.use('/', router); // This handles POST /upload

// Optional: catch-all for unknown routes
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
