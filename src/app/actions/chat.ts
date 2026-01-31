'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function sendChatMessage(history: { role: 'user' | 'model', parts: string }[], message: string) {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing.");
    }

    const modelsToTry = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
                history: history.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.parts }]
                })),
                generationConfig: {
                    maxOutputTokens: 1000, // Increased for better responses
                },
            });

            const result = await chat.sendMessage(message);
            const response = result.response;
            return response.text();
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    // If all failed
    console.error("All Gemini models failed:", lastError);
    throw new Error(`AI unavailable: ${lastError?.message || "Please try again later."}`);
}
