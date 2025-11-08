import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { extractDrugs } from './drugExtractor.js'; // Import the new module
import { fetchAllInteractions } from '../utils/openfda.js';
import { getInteractionBetweenDrugs } from '../utils/drugInteractionsDb.js';
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
          const tabletsWithDrugs = await Promise.all(
            ocrResults.map(async (item) => {
              // Join all text lines into a single string for matching
              const fullText = item.text.join(' ');

              const detectedDrugs = await extractDrugs(fullText);

              return {
                image: item.image,
                text: item.text,
                detected_drugs: detectedDrugs
              };
            })
          );

         
          const tabletsWithInteractions = await fetchAllInteractions(tabletsWithDrugs);
          console.log(tabletsWithDrugs);
          console.log(tabletsWithInteractions);

          const tabletsWithDetections = tabletsWithInteractions.filter(
            (tablet) => tablet.detected_drugs?.length
          );

          if (tabletsWithDetections.length >= 2) {
            const primaryDrugA = tabletsWithDetections[0].detected_drugs[0] || {};
            const primaryDrugB = tabletsWithDetections[1].detected_drugs[0] || {};

            let dbInteraction = null;

            if (primaryDrugA.name && primaryDrugB.name) {
              dbInteraction = await getInteractionBetweenDrugs(
                primaryDrugA.name,
                primaryDrugB.name
              );
            }

            const toTabletPayload = (tablet, counterpartName) => {
              const primaryDrug = tablet.detected_drugs[0] || {};
              return {
                name: primaryDrug.name || "N/A",
                drugbank_id: primaryDrug.drugbank_id || "N/A",
                openfda_interaction: primaryDrug.openfda_interaction || null,
                database_interaction: dbInteraction,
                counterpart_name: counterpartName || "N/A"
              };
            };

            const tablet1 = toTabletPayload(
              tabletsWithDetections[0],
              primaryDrugB.name
            );
            const tablet2 = toTabletPayload(
              tabletsWithDetections[1],
              primaryDrugA.name
            );

            // console.log(tablet1, tablet2);
            const healthDetails = req.body.healthDetails || null;
            const summary = await summarizeInteractions(tablet1, tablet2, healthDetails);

            res.json({ 
              summary,
              tablet1Name: tablet1.name,
              tablet2Name: tablet2.name
            });
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

