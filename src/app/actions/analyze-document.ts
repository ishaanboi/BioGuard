'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const modelsToTry = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash"];

// Helper to try models in order
async function tryGenerate(base64Data: string, mimeType: string) {
    let lastError: any;
    for (const modelName of modelsToTry) {
        try {
            console.log(`Analyzing with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            return await generateAnalysis(model, base64Data, mimeType);
        } catch (error: any) {
            console.warn(`Model ${modelName} failed analysis:`, error.message);
            lastError = error;
        }
    }
    // If all fail, throw the last error
    throw new Error(`All analysis models failed. Last error: ${lastError?.message || "Unknown error"}`);
}


// Original function (URL-based)
export async function analyzeMedicalDocument(fileUrl: string, mimeType: string, idToken: string) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API Key is missing.");

    try {
        // 1. Verify User & Rate Limit
        const { admin } = await import('@/lib/firebase-admin');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;
        const uid = decodedToken.uid;

        const isAdmin = email === 'i.ishaanpant21@gmail.com';

        if (!isAdmin) {
            // Check rate limit
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const db = admin.firestore();
            const q = db.collection('analysis_requests')
                .where('userId', '==', uid)
                .where('timestamp', '>=', today);

            const snapshot = await q.count().get();
            const usageCount = snapshot.data().count;

            if (usageCount >= 5) {
                throw new Error("Daily analysis limit reached (5/day). Upgrade for more.");
            }

            // Log usage
            await db.collection('analysis_requests').add({
                userId: uid,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                fileUrl: fileUrl, // minimal-logging
                metadata: { mimeType }
            });
        }

        console.log(`Fetching file URL: ${fileUrl}`);
        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) throw new Error("Failed to fetch image for analysis");

        const arrayBuffer = await fileRes.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        return await tryGenerate(base64Data, mimeType);

    } catch (error: any) {
        console.error("Gemini Analysis Error:", error);
        throw new Error(error.message || "Failed to analyze document.");
    }
}

// New function for direct Base64 (from Client)
export async function analyzeBase64(base64Data: string, mimeType: string) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API Key is missing.");

    try {
        return await tryGenerate(base64Data, mimeType);
    } catch (error: any) {
        console.error("Gemini Base64 Analysis Error:", error);
        throw new Error(error.message || "Failed to analyze document.");
    }
}

// Shared helper
async function generateAnalysis(model: any, base64Data: string, mimeType: string) {
    const prompt = `
        You are an expert medical AI assistant for BioGuard.
        Analyze this uploaded medical document (image or PDF page).
        
        Provide a concise summary in this JSON format (return ONLY clean JSON, no markdown):
        {
            "summary": "2-3 sentences summarising the key medical findings.",
            "category": "Suggest likely category: Lab Report, Prescription, Imaging, Insurance, Other",
            "riskLevel": "Low | Medium | High",
            "anomalies": ["List specific anomalies or abnormal values if any"]
        }
    `;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        }
    ]);

    const response = result.response;
    const text = response.text();
    console.log("Raw Gemini Response:", text);

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
}

export async function getDailyAnalysisUsage(idToken: string) {
    try {
        const { admin } = await import('@/lib/firebase-admin');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;
        const uid = decodedToken.uid;

        const isAdmin = email === 'i.ishaanpant21@gmail.com';

        if (isAdmin) {
            return { usage: 0, limit: -1, isAdmin: true }; // -1 indicates unlimited
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const db = admin.firestore();
        const q = db.collection('analysis_requests')
            .where('userId', '==', uid)
            .where('timestamp', '>=', today);

        const snapshot = await q.count().get();
        const usageCount = snapshot.data().count;

        return { usage: usageCount, limit: 5, isAdmin: false };
    } catch (error: any) {
        console.error("Error fetching usage:", error);
        throw new Error("Failed to fetch usage stats.");
    }
}


export async function analyzeText(text: string) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API Key is missing.");

    const prompt = `Analyze this medical context and provide a brief, patient-friendly summary: ${text}`;

    let lastError: any;
    for (const modelName of modelsToTry) {
        try {
            console.log(`Analyzing text with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        } catch (error: any) {
            console.warn(`Model ${modelName} failed text analysis:`, error.message);
            lastError = error;
        }
    }
    throw new Error(`All analysis models failed. Last error: ${lastError?.message || "Unknown error"}`);
}
