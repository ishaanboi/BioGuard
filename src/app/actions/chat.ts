'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { headers } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple In-Memory Rate Limiter (Note: Resets on server restart/serverless function cold boot)
// Key: IP Address, Value: { count: number, resetTime: number }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // max messages
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function sendChatMessage(history: { role: 'user' | 'model', parts: string }[], message: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing.");
    }

    // Rate Limiting Logic
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    // Ignore rate-limit for local testing or could check user claims for admin
    if (ip !== '127.0.0.1' && ip !== '::1') {
        const now = Date.now();
        const userLimit = rateLimitMap.get(ip);

        if (userLimit && now < userLimit.resetTime) {
            if (userLimit.count >= RATE_LIMIT_MAX) {
                console.warn(`[RATE LIMIT] IP ${ip} blocked from Chatbot.`);
                throw new Error("You are speaking too quickly. Please wait a minute before sending another message.");
            }
            userLimit.count += 1;
        } else {
            // New window
            rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        }
    }

    const modelsToTry = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
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
