import { GoogleGenerativeAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function askConcierge(
  prompt: string,
  restaurantContext?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const fullPrompt = `
You are a knowledgeable Moroccan Concierge named "Hakim" for the app "Besaha".
Your tone is warm, welcoming, and culturally respectful.
Context: The user is asking about Moroccan food or culture.
Restaurant Context: ${restaurantContext || "General inquiry"}

User Question: ${prompt}

Answer briefly (under 100 words) and helpfully.
`;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am having trouble connecting to the spirits of the internet. Please try again.";
  }
};
