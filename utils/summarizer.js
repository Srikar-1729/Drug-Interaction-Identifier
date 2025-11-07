import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ✅ use v1 models
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const summarizeInteractions = async (tablet1, tablet2) => {
  
  const prompt = `
You are a medical summarizer. I will give you two objects named tablet1 and tablet2. Each object contains:
- brand_name
- generic_name
- drug_interactions (a text field from OpenFDA)

Your task:
1. Carefully check the drug_interactions of tablet1 to see if it mentions tablet2 (by its generic or brand name).
2. Check the drug_interactions of tablet2 to see if it mentions tablet1.
3. If either mentions the other, explain the interaction in simple terms suitable for a patient with no medical background. Make sure to have the summary atleast in three sentences.
4. If no interaction is found, clearly state:
   "No drug interaction was found between ${tablet1.generic_name} and ${tablet2.generic_name}."
5. Keep the explanation short, easy to understand, and non-technical. Avoid medical jargon.

tablet1:
${JSON.stringify(tablet1, null, 2)}

tablet2:
${JSON.stringify(tablet2, null, 2)}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
