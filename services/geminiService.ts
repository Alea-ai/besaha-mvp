import { GoogleGenAI } from "@google/genai"; // ✅ correct import for browser

const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // ✅ Vite env variable syntax

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing"); // ✅ good runtime check
}

const client = new GoogleGenAI({ apiKey }); // ✅ correct instantiation

export async function askConcierge(
  prompt: string, // ✅ TypeScript type for input
  restaurantContext?: string // ✅ optional string
): Promise<string> { // ✅ TypeScript return type
  try {
    const fullPrompt = `
You are a knowledgeable Moroccan Concierge named "Hakim" for the app "Besaha".
Your tone is warm, welcoming, and culturally respectful.
Context: The user is asking about Moroccan food or culture.
Restaurant Context: ${restaurantContext || "General inquiry"}

User Question: ${prompt}

Answer briefly (under 100 words) and helpfully.
`; // ✅ template string, correct syntax

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash", // ✅ string literal
      contents: fullPrompt,       // ✅ string
    });

    return response.text || "I'm sorry, I couldn't find an answer to that."; // ✅ safe fallback
  } catch (error) {
    console.error("Gemini API Error:", error); // ✅ logs error
    return "I am having trouble connecting to the spirits of the internet. Please try again."; // ✅ safe fallback
  }
}

