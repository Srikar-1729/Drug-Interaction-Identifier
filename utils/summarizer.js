import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ✅ use v1 models
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const summarizeInteractions = async (tablet1, tablet2, healthDetails = null) => {
  
  let prompt = `
You are a medical summarizer. I will give you two objects named tablet1 and tablet2. Each object contains:
- name
- drugbank_id
- openfda_interaction (text pulled from the OpenFDA API, may be null)
- database_interaction (text pulled from an internal database, may be null)
- counterpart_name (the other drug in the comparison)

Your task:
1. Review both openfda_interaction and database_interaction for each tablet to determine whether they describe an interaction with the counterpart_name.
2. Synthesize the information from any available sources (OpenFDA and/or database). If only one source has data, rely on that. If both have data, combine the insights consistently.
3. Explain the interaction (or lack of interaction) in simple, patient-friendly language using at least three sentences.
4. If neither source describes an interaction, clearly state:
   "No drug interaction was found between ${tablet1.name} and ${tablet2.name}."
5. Keep the explanation short, easy to understand, and avoid medical jargon.`;

  // Add personalization context if health details are provided
  if (healthDetails && healthDetails.trim()) {
    prompt += `

IMPORTANT - Personalization Context:
The patient has provided the following health information:
"${healthDetails}"

Please personalize your summary by:
-Highly important to keep the explanation to max three sentences only.
- Considering how the drug interaction might specifically affect this patient given their health conditions, allergies, or other medications mentioned.
- Highlighting any particular risks or considerations relevant to their health profile.
- Providing tailored advice that takes into account their personal health context.
- If the patient's health conditions or medications could interact with the drug combination, make this a priority in your explanation.`;
  }

  prompt += `

tablet1:
${JSON.stringify(tablet1, null, 2)}

tablet2:
${JSON.stringify(tablet2, null, 2)}
`;
  
  console.log(JSON.stringify(tablet1, null, 2));
  console.log(JSON.stringify(tablet2, null, 2));
  if (healthDetails) {
    console.log('Health Details:', healthDetails);
  }
  const result = await model.generateContent(prompt);
  return result.response.text();
};
