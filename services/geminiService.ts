
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { ResumeAnalysis, Job, ApplicationInsight } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Robust wrapper for API calls with exponential backoff to handle 429 errors.
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('429') || error.status === 429)) {
      console.warn(`Quota exceeded. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysis> => {
  const ai = getAI();
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following resume text and provide a JSON response with structure:
      {
        "score": number (0-100),
        "parsedName": string,
        "parsedRole": string,
        "improvements": string[] (exactly 3 bullet points),
        "skills": string[],
        "summary": string
      }
      
      Resume content: ${resumeText}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            parsedName: { type: Type.STRING },
            parsedRole: { type: Type.STRING },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["score", "parsedName", "parsedRole", "improvements", "skills", "summary"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as ResumeAnalysis;
  });
};

export const fetchJobs = async (query: string, location: string, filters: any): Promise<Job[]> => {
  const ai = getAI();
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for ${filters.locationType || ''} ${filters.employmentType || ''} job openings for "${query}" in "${location}" or worldwide. 
      Prioritize listings from LinkedIn and company career pages.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const structuredResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on your search results, create a JSON list of 6 job openings. Include detailed requirements and company details.
      Search Results: ${response.text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING },
              description: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              employmentType: { type: Type.STRING },
              locationType: { type: Type.STRING },
              sourceUrl: { type: Type.STRING },
              companyDetails: { type: Type.STRING },
              postedDate: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(structuredResponse.text || '[]') as Job[];
  });
};

export const getApplicationInsights = async (resume: ResumeAnalysis, job: Job): Promise<ApplicationInsight> => {
  const ai = getAI();
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a detailed gap analysis between this resume and job requirements.
      Resume: ${JSON.stringify(resume)}
      Job: ${JSON.stringify(job)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            tipsToWin: { type: Type.STRING }
          },
          required: ["status", "reasoning", "missingKeywords", "tipsToWin"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as ApplicationInsight;
  });
};

export const getCompanyLocation = async (companyName: string) => {
  const ai = getAI();
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find office locations and cultural summary for ${companyName}.`,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });
    return response.text;
  });
};
