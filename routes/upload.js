import express from 'express';
import multer from 'multer';
// import path from 'path';
import { extractText } from '../controllers/ocrController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });


// Upload route using upload.fields
router.post(
  '/upload',
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]),
  extractText // call the controller
);

export default router;