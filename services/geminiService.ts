import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const askConcierge = async (prompt: string, restaurantContext?: string): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "AI Concierge is currently offline (API Key missing). Please try again later.";
  }

  try {
    const fullPrompt = `
      You are a knowledgeable Moroccan Concierge named "Hakim" for the app "Besaha".
      Your tone is warm, welcoming, and culturally respectful.
      Context: The user is asking about Moroccan food or culture.
      Restaurant Context: ${restaurantContext || 'General inquiry'}

      User Question: ${prompt}

      Answer briefly (under 100 words) and helpfuly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return response.text || "I'm sorry, I couldn't find an answer to that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am having trouble connecting to the spirits of the internet. Please try again.";
  }
};
