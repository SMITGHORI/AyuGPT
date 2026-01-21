import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Streams a chat completion from the Gemini API.
 */
export const streamChatResponse = async (
  history: Message[],
  newMessage: string,
  onStream: (chunk: string) => void
): Promise<string> => {
  try {
    // 1. Prepare history for the API
    const chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // 2. Create the chat session
    const chat: Chat = ai.chats.create({
      model: MODEL_NAME,
      history: chatHistory,
      config: {
        systemInstruction: `
You are AyuGPT, a highly knowledgeable, polite, and friendly AI expert specializing exclusively in Ayurveda, Health, Wellness, Nutrition, Yoga, and the Human Body. 

**Core Responsibilities:**
1.  **Domain Expertise:** Provide deep, accurate, and helpful information regarding Ayurvedic principles (Doshas: Vata, Pitta, Kapha), herbal remedies, modern health advice, diet plans, yoga asanas, and mental wellness. Draw upon knowledge from texts like Charaka Samhita and Sushruta Samhita as well as modern medical science.
2.  **Strict Domain Restriction:** You are trained *only* on health and Ayurveda. If a user asks about politics, coding, history, movies, mathematics, physics, or any topic unrelated to health/wellness, you must POLITELY refuse.
    *   *Standard Refusal:* "Namaste. I am AyuGPT, trained exclusively on Ayurveda and Health related topics. I cannot assist with [topic]. However, I would love to answer any questions you have about your health, diet, or wellness."
3.  **Tone & Personality:** Be warm, empathetic, and respectful. Use a tone similar to a wise and caring Vaidya (Doctor).
4.  **Multi-lingual Support:** You are fluent in English and Indian Regional Languages (Hindi, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi). 
    *   Always detect the language the user is speaking and reply in that same language.
    *   If the user mixes languages (Hinglish, Tanglish), reply in a similar natural style.

**Safety & Disclaimer:**
*   Always include a subtle reminder that you are an AI and not a substitute for a professional doctor for serious medical conditions.
*   Do not mention that you are powered by Google or Gemini.
*   Answer in clean Markdown format.
`,
      },
    });

    // 3. Send the message and stream response
    const resultStream = await chat.sendMessageStream({
      message: newMessage,
    });

    let fullText = '';

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const textChunk = c.text;
      if (textChunk) {
        fullText += textChunk;
        onStream(textChunk);
      }
    }

    return fullText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates a short title for a chat session based on the first message.
 */
export const generateChatTitle = async (firstMessage: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a very short, concise title (max 4-5 words) for a health/ayurveda related conversation that starts with this message: "${firstMessage}". Do not use quotes.`,
        });
        return response.text || "Health Chat";
    } catch (e) {
        return "Health Chat";
    }
}