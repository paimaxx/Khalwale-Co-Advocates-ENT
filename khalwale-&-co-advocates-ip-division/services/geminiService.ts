
import { GoogleGenAI, Chat, Type, FunctionDeclaration } from "@google/genai";
import { ContractFile, UserInfo, QuizQuestion } from "../types";

const processEnvApiKey = process.env.API_KEY;

if (!processEnvApiKey) {
  console.error("API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

export const analyzeContract = async (
  file: ContractFile,
  userInfo: UserInfo
): Promise<string> => {
  try {
    const prompt = `
      You are a senior entertainment lawyer working for Khalwale & Co Advocates IP Division.
      Your client is ${userInfo.name}.
      
      Task: Review the attached contract document specifically for the Entertainment, Music, or Film industry.
      
      Jurisdiction Requirements:
      1. Primary Analysis: Kenyan Law. Ensure all clauses are vetted against Kenyan Contract Law and Copyright Act.
      2. Comparative Analysis: United States Law (California/New York standards) and United Kingdom Law.
      
      Please provide a comprehensive review in Markdown format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.mimeType,
              data: file.base64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        temperature: 0.4,
      },
    });

    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Error analyzing contract:", error);
    throw error;
  }
};

export const generateAttorneyBrief = async (
  userInfo: UserInfo,
  contractAnalysis: string,
  clientComplaints: string
): Promise<string> => {
  try {
    const prompt = `
      You are a senior partner at Khalwale & Co Advocates IP Division. 
      Prepare a structured Attorney Briefing Note for ${userInfo.name}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.3 }
    });

    return response.text || "Brief generation failed.";
  } catch (error) {
    console.error("Error generating brief:", error);
    return "Error generating attorney brief.";
  }
};

export const createChatSession = (): Chat => {
  const uploadTool: FunctionDeclaration = {
    name: 'offerContractUpload',
    description: 'Offer the user the option to upload their contract for review.',
    parameters: { type: Type.OBJECT, properties: {} },
  };

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `
        You are "Khatiebi", a professional and helpful female AI support agent for the Khalwale & Co Advocates IP Division.
        
        Your Tone: Professional, authoritative, yet approachable and elegant.
        
        Key Knowledge:
        1. **Service:** AI-powered contract review for Music, Film, and Entertainment in Kenya (IP Division).
        2. **Process:** Details -> Upload -> AI Analysis -> Pay KSH 5,000 via Pesapal -> Human Lawyer Consultation.
        3. **Education:** We offer a 20-question quiz on IP rights (MCSK, KECOBO, Berne Convention).
        4. **Mailing List:** Users can join our Creative Database on the landing page.
        
        Refer to yourself as Khatiebi. Use professional, supportive language appropriate for a high-end legal firm.
      `,
      tools: [{ functionDeclarations: [uploadTool] }],
    }
  });
};

export const generateQuizQuestions = async (category: string): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
      Generate EXACTLY 20 multiple-choice questions for an advanced quiz about "${category}" in the Entertainment and Intellectual Property sector.
      
      Sources to use for information:
      - Kenya Copyright Board (KECOBO)
      - Music Copyright Society of Kenya (MCSK)
      - Performers Rights Society of Kenya (PRISK)
      - WIPO (World Intellectual Property Organization)
      - International treaties like the Berne Convention for the Protection of Literary and Artistic Works.
      
      Each question MUST include:
      1. question: The query.
      2. options: Exactly 4 options.
      3. correctAnswerIndex: 0-3.
      4. explanation: A brief explanation of the law.
      5. sourceUrl: A valid URL to the official source page (e.g., kecobo.go.ke, mcsk.or.ke, or wipo.int) where the user can study this specific topic.
      
      Format: Return ONLY a raw JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    if (!response.text) return [];
    const jsonStr = response.text.trim().replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(jsonStr) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};
