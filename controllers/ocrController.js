import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { extractDrugs } from './drugExtractor.js'; // Import the new module
import { fetchAllInteractions } from '../utils/openfda.js';
import { summarizeInteractions } from '../utils/summarizer.js';
export const extractText = (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const imagePaths = [];
    if (req.files.image1) imagePaths.push(req.files.image1[0].path);
    if (req.files.image2) imagePaths.push(req.files.image2[0].path);

    execFile(
      'python',
      [path.join(process.cwd(), 'ocr_script.py'), ...imagePaths],
      async (err, stdout, stderr) => {
        // Delete uploaded files
        imagePaths.forEach((p) => fs.unlink(p, () => {}));

        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'OCR processing failed' });
        }

        try {
          const data = JSON.parse(stdout.trim());
          // console.log(data)
          const ocrResults = data.results;
          // console.log(ocrResults);
          // Iterate over OCR results (array of objects)
          const tabletsWithDrugs = ocrResults.map((item) => {
            // Join all text lines into a single string for matching
            const fullText = item.text.join(' ').toLowerCase();
            
            return {
              image: item.image,
              text: item.text,
              detected_drugs: extractDrugs(fullText)
            };
          });

         
          const tabletsWithInteractions = await fetchAllInteractions(tabletsWithDrugs);
          console.log(tabletsWithDrugs);
          console.log(tabletsWithInteractions);
         
  if (tabletsWithInteractions.length >= 2) {
  const tablet1 = {
    brand_name: tabletsWithInteractions[0].detected_drugs[0]?.brand_name || "N/A",
    generic_name: tabletsWithInteractions[0].detected_drugs[0]?.generic_name || "N/A",
    drug_interactions: tabletsWithInteractions[0].detected_drugs[0]?.interactions || "No known interactions"
  };

  const tablet2 = {
    brand_name: tabletsWithInteractions[1].detected_drugs[0]?.brand_name || "N/A",
    generic_name: tabletsWithInteractions[1].detected_drugs[0]?.generic_name || "N/A",
    drug_interactions: tabletsWithInteractions[1].detected_drugs[0]?.interactions || "No known interactions"
  };

  // console.log(tablet1, tablet2);
  const summary = await summarizeInteractions(tablet1, tablet2);


  
  res.json({ summary });
} else {
  res.status(400).json({ error: "Less than two tablets detected" });
}



          // return res.json({ tablets: tabletsWithDrugs });
        } catch (parseErr) {
          console.error(parseErr);
          return res.status(500).json({ error: 'Failed to parse OCR output' });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

