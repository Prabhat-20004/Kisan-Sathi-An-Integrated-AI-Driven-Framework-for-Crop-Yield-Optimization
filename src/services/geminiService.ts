
import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getCropAdvice(query: string, imageBase64?: string) {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are an expert Indian Agronomist for Kisan Sathi. 
    Provide practical, organic and chemical solutions for Indian farmers.
    Keep language simple and empathetic. Use Markdown for formatting.
    If an image is provided, diagnose the pest or disease.
    Contextual factors to consider: typical Indian soil health, monsoons, and local pesticide availability.
  `;

  const contents: any[] = [{ text: query }];
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text;
}

export async function* getCropAdviceStream(query: string, imageBase64?: string) {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are an expert Indian Agronomist for Kisan Sathi. 
    Provide practical, organic and chemical solutions for Indian farmers.
    Keep language simple and empathetic. Use Markdown for formatting.
    If an image is provided, diagnose the pest or disease.
    Contextual factors to consider: typical Indian soil health, monsoons, and local pesticide availability.
  `;

  const contents: any[] = [{ text: query }];
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContentStream({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

export async function assessCropQuality(imageBase64: string) {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: "Analyze the quality of this agricultural produce. Grade it as A (Excellent), B (Good), or C (Average). Provide a brief 1-sentence reason." },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grade: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["grade", "reason"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function getCropRecommendation(soilData: any, location: string) {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Based on the following soil data and location in India, predict the best crop for the current season (April/Spring).
    Location: ${location}
    Soil Data: ${JSON.stringify(soilData)}
    
    Provide a professional agricultural recommendation. 
    Include:
    1. Recommended Crop Name
    2. Why this crop is best for this soil
    3. Expected duration to harvest
    4. 3 Quick tips for success
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: {
      temperature: 0.7,
    }
  });

  return response.text;
}
