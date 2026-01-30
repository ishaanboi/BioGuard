const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hardcoding key for the test script to ensure it's exactly what was provided
// (In production/app we use env vars properly)
const apiKey = "AIzaSyCkxQeCpEmioW2TjIyFp4Q8Q1Ab1ZReypw";

async function check() {
    console.log("Checking API Key availability...");
    try {
        // Direct fetch to list models, bypassing SDK defaults if possible to see raw response
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else if (data.models) {
            console.log("Successfully connected! Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Supports generateContent)`);
                }
            });
        } else {
            console.log("Unexpected response:", data);
        }
    } catch (e) {
        console.error("Network/Fetch Error:", e);
    }
}

check();
