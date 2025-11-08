import axios from 'axios';

export const getDrugInteractions = async (drugName) => {
  try {
    if (!drugName) {
      return 'No known interactions';
    }

    const encodedName = encodeURIComponent(drugName);
    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodedName}"+openfda.brand_name:"${encodedName}"&limit=1`;
    const response = await axios.get(url);

    if (response.data.results?.length > 0) {
      const drug = response.data.results[0];
      return drug.drug_interactions ?? 'No known interactions';
    }
    return 'No known interactions';
  } catch (err) {
    console.error(`Error fetching interactions for ${drugName}:`, err.message);
    return 'No known interactions';
  }
};

export const fetchAllInteractions = async (tabletsWithDrugs) => {
  return Promise.all(tabletsWithDrugs.map(async (tablet) => {
    tablet.detected_drugs = await Promise.all(
      tablet.detected_drugs.map(async (drug) => {
        drug.openfda_interaction = await getDrugInteractions(drug.name);
        return drug;
      })
    );
    return tablet;
  }));
};
