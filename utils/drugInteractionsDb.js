import pool from '../db/client.js';

export const getInteractionBetweenDrugs = async (drugA, drugB) => {
  if (!drugA || !drugB) {
    return null;
  }

  const normalizedA = drugA.trim().toLowerCase();
  const normalizedB = drugB.trim().toLowerCase();

  if (!normalizedA || !normalizedB) {
    return null;
  }

  try {
    const { rows } = await pool.query(
      `
        SELECT drug_name, interacting_drug_name, drug_interactions
        FROM drug_interactions
        WHERE (
          LOWER(drug_name) = $1 AND LOWER(interacting_drug_name) = $2
        ) OR (
          LOWER(drug_name) = $2 AND LOWER(interacting_drug_name) = $1
        )
        LIMIT 1
      `,
      [normalizedA, normalizedB]
    );

    if (!rows.length) {
      return null;
    }

    const { drug_interactions: interaction } = rows[0];
    return interaction || null;
  } catch (error) {
    console.error('Error fetching drug interaction from database:', error);
    return null;
  }
};

