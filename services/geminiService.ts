import { GoogleGenAI } from "@google/genai";

export const generateNewsContent = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Je bent een assistent voor de directie van een basisschool. Schrijf een kort, enthousiast nieuwsbericht (max 100 woorden) voor de schoolwebsite op basis van deze input: "${prompt}". Gebruik warme, professionele taal.`,
    });
    
    return response.text || "Kon geen tekst genereren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is een fout opgetreden bij het verbinden met de AI assistent.";
  }
};