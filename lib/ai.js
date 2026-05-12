const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const AI_MODEL = process.env.AI_MODEL || "llama-3.1-70b-versatile";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-1.5-flash";

const getGroqApiKey = () => process.env.GROQ_API_KEY;

const readJsonFromText = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("AI did not return JSON");
        return JSON.parse(match[0]);
    }
};

export async function generateAIJson({ system, user, temperature = 0.4 }) {
    const apiKey = getGroqApiKey();

    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY");
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: AI_MODEL,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
            temperature,
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.error?.message || "AI request failed");
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned an empty response");

    return readJsonFromText(content);
}

export async function generateAIFromImage({ system, user, imageBase64 }) {
    if (!GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY. Please check your .env file.");
    }

    const url = `${GEMINI_API_BASE}/${GEMINI_VISION_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: `${system}\n\n${user}` },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
            }
        }),
    });

    const data = await response.json().catch(() => ({}));

    console.log("Gemini Response Status:", response.status);

    if (!response.ok) {
        throw new Error(data?.error?.message || `AI vision request failed with status ${response.status}`);
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("AI returned an empty response");

    return readJsonFromText(content);
}