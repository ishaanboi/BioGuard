import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeMedicalDocument = async (textOrImageUrl: string, type: 'text' | 'image') => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing. Returning mock data.");
        return "Simulated AI Analysis: High contrast in image suggesting density. Recommend further consultation.";
    }

    const prompt = `Analyze this medical context and provide a brief, patient-friendly summary: ${textOrImageUrl}`;

    try {
        // Attempt 1: gemini-flash-latest (Confirmed available)
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.warn("Primary model (gemini-flash-latest) failed, attempting fallback...", error.message);

        try {
            // Attempt 2: gemini-2.5-flash-lite (Confirmed available)
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const result = await fallbackModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (fallbackError: any) {
            console.error("Gemini Analysis Critical Failure:", fallbackError);
            return `AI Error: ${fallbackError.message || "Service unavailable"}. Please try again later.`;
        }
    }
};
