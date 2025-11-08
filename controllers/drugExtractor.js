import pool from '../db/client.js';

/**
 * Extracts drugs from OCR text and validates against the database
 * @param {string} ocrText - Text extracted from OCR
 * @returns {Promise<Array>} - List of detected drugs with name and drugbank_id
 */
export const extractDrugs = async (ocrText) => {
  if (!ocrText) return [];

  // Normalize OCR text
  const normalizedText = ocrText
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalizedText) {
    return [];
  }

  try {
    const { rows } = await pool.query(
      `
        SELECT drug_name, drugbank_id
        FROM drugs
        WHERE drug_name IS NOT NULL
          AND POSITION(LOWER(drug_name) IN $1) > 0
      `,
      [normalizedText]
    );

    if (!rows.length) {
      return [];
    }

    const uniqueById = new Map();

    rows.forEach((row) => {
      if (!row.drug_name) {
        return;
      }

      const name = row.drug_name.trim();
      if (!name) {
        return;
      }

      const key = row.drugbank_id || name.toLowerCase();
      if (!uniqueById.has(key)) {
        uniqueById.set(key, {
          name,
          drugbank_id: row.drugbank_id || null
        });
      }
    });

    return Array.from(uniqueById.values());
  } catch (error) {
    console.error('Failed to validate drugs against the database:', error);
    return [];
  }
};
