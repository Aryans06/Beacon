import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 1024,
  responseMimeType: "application/json",
};

export async function analyzeEmergency(message: string) {
  if (!apiKey || apiKey === "your_key_here") {
    // Return mock data if no API key is provided
    return {
      translation: message,
      severity: message.toLowerCase().includes("fire") ? "critical" : "warning",
      room: "Unknown",
      threatType: "Other",
      summary: "AI analysis pending API key.",
      protocol: ["Assess scene safety", "Verify location details"],
      instructions: "We are receiving your signal. Stay where you are until help arrives."
    };
  }

  const prompt = `
    You are the Beacon Emergency AI, a critical crisis response system for hospitality venues. 
    Analyze the following distress message from a guest. 
    
    1. Translate to English if needed.
    2. Extract severity (critical, warning, or info).
    3. Extract a room number if mentioned.
    4. Categorize as Fire, Medical, Security, or Other.
    5. Provide a 1-sentence summary for the command dashboard.
    6. Provide a list of recommended protocols for staff and responders.
    7. Provide a direct instruction message for the guest to follow immediately.

    Distress Message: "${message}"

    Return the analysis ONLY as a JSON object with this exact schema:
    {
      "translation": string,
      "severity": "critical" | "warning" | "info",
      "room": string,
      "threatType": "Fire" | "Medical" | "Security" | "Other",
      "summary": string,
      "protocol": string[],
      "instructions": string
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
