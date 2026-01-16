import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TelemetryPoint } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeCrashTelemetry = async (
  telemetryData: TelemetryPoint[],
  vehicleType: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key missing. Cannot perform AI analysis.";

  // Prepare a concise summary of the last 5 seconds of telemetry
  const recentData = telemetryData.slice(-5);
  const dataString = JSON.stringify(recentData, null, 2);

  const prompt = `
    You are an expert Accident Detection and Safety Analyst system for connected vehicles.
    
    Analyze the following telemetry data snippet leading up to a triggered event for a ${vehicleType}.
    Data format: Array of { timestamp, speed (km/h), gForceX, gForceY, brakeForce (0-1) }.
    
    Telemetry Data:
    ${dataString}

    Task:
    1. Assess the severity of the accident (Minor, Moderate, Severe, Critical).
    2. Analyze the G-force vectors to determine the type of impact (e.g., Frontal collision, T-bone, Rollover, Hard braking/False Positive).
    3. Recommend the appropriate emergency response (e.g., No action, Dispatch Ambulance, Dispatch Fire/Rescue).
    4. Provide a brief confidence score (0-100%) for this analysis.

    Keep the response concise, technical, and formatted in Markdown.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster response
        temperature: 0.2, // Low temperature for analytical consistency
      }
    });

    return response.text || "Analysis complete but no text returned.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI Analysis temporarily unavailable due to network or API error.";
  }
};