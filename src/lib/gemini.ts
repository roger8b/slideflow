import { GoogleGenAI } from "@google/genai";

// Access the API key through process.env if available, or fallback to an empty string.
// The key is injected at build time via Vite's 'define' configuration.
const apiKey = (process.env.GEMINI_API_KEY || "") as string;
const genAI = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `
You are an expert layout generator for Slideflow. Take a text description and convert it into a structured JSON array of component objects.

Available Components:
1. "Title": { text: string, fontSize: number, color: string, textAlign: "left"|"center"|"right", fontWeight: "normal"|"bold"|"black" }
2. "Text": { text: string, fontSize: number, color: string, textAlign: "left"|"center"|"right"|"justify" }
3. "Container": { flexDirection: "row"|"column", alignItems: "flex-start"|"center"|"flex-end"|"stretch", justifyContent: "flex-start"|"center"|"flex-end"|"space-between", background: string, padding: number, gap: number, borderRadius: number, children: Component[] }

Color Palette:
- Dark: #495464, Muted: #BBBFCA, Light: #E8E8E8, Background: #F4F4F2

CRITICAL RULES:
- Return ONLY a valid JSON array. No markdown backticks, no explanatory text.
- Component properties MUST be at the top level of the object (e.g., { "type": "Title", "text": "Hello" }).
- For comparisons or side-by-side content, use a "Container" with flexDirection: "row".
- Max nesting depth: 3 levels.
- You are using gemini-2.5-flash. Be precise and creative with layouts.
`;

export const generateAILayout = async (userPrompt: string) => {
    const timestamp = new Date().toISOString();
    console.group(`🤖 Gemini GenAI Call - ${timestamp}`);
    console.log("Prompt:", userPrompt);

    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY is missing");
        console.groupEnd();
        throw new Error("Gemini API Key not found. Please configure GEMINI_API_KEY in your settings.");
    }

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser request: ${userPrompt}` }]
            }]
        });

        const text = (result.text as any) || "";
        console.log("Raw Response:", text);

        const cleanedText = text.replace(/```json|```/g, "").trim();

        // Basic validation that it's an array
        const parsed = JSON.parse(cleanedText);
        console.log("Parsed Components:", parsed);
        console.groupEnd();

        if (!Array.isArray(parsed)) {
            return [parsed]; // Wrap in array if single object
        }
        return parsed;
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        console.groupEnd();
        throw error;
    }
};
