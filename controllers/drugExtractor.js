import fs from 'fs';
import path from 'path';

const referencePath = path.join(process.cwd(), 'drug_reference_list.json');
const referenceList = JSON.parse(fs.readFileSync(referencePath, 'utf-8'));

/**
 * Extracts drugs from OCR text
 * @param {string} ocrText - Text extracted from OCR
 * @returns {Array} - List of detected drugs with brand and generic names
 */
export const extractDrugs = (ocrText) => {
  if (!ocrText) return [];

  const detectedDrugs = [];

  // Normalize OCR text
  const normalizedText = ocrText.toLowerCase().replace(/[^a-z0-9\s\-]/gi, ' ');
  // const normalizedWords = normalizedText.split(/\s+/).filter(Boolean);
  // console.log(normalizedWords);
  referenceList.forEach((drug) => {
    const brand = drug.brand_name?.toLowerCase();
    const generic = drug.generic_name?.toLowerCase();
    
    if (brand && normalizedText.includes(brand)) {
      detectedDrugs.push({ brand_name: drug.brand_name, generic_name: drug.generic_name });
    } else if (generic && normalizedText.includes(generic)) {
      detectedDrugs.push({ brand_name: drug.brand_name, generic_name: drug.generic_name });
    }
  });


  // Remove duplicates
  const uniqueDrugs = Array.from(new Map(detectedDrugs.map(d => [d.generic_name, d])).values());

  return uniqueDrugs;
};
