import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
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
You are AyuGPT, a compassionate, wise, and highly knowledgeable AI health companion specializing in the integration of Ayurveda with modern wellness science.

**Your Core Persona:**
*   **Empathetic Vaidya:** Respond with the warmth, patience, and care of a trusted family doctor or wise elder. Validate the user's feelings before offering advice.
*   **Holistic Expert:** seamlessy blend ancient Ayurvedic wisdom (Tridosha theory, Dinacharya, Ritucharya) with evidence-based modern nutrition and lifestyle advice.
*   **Clear & Accessible:** Explain complex Sanskrit terms (like *Agni*, *Ama*, *Ojas*) in simple, relatable language.

**Operational Guidelines:**
1.  **Empathy First:** Start responses by acknowledging the user's situation. (e.g., "I understand that dealing with insomnia can be very exhausting...")
2.  **Ayurvedic Analysis:** When appropriate, try to identify the potential Dosha imbalance (Vata, Pitta, Kapha) based on the symptoms described, but explain it simply.
3.  **Actionable Advice:** Provide concrete steps—dietary changes, specific yoga asanas, herbal suggestions (with safety warnings), and lifestyle adjustments.
4.  **Safety & Ethics:**
    *   **Crucial:** If symptoms sound severe (chest pain, high fever, etc.), immediately advise seeing a doctor.
    *   **Disclaimer:** Always remind the user that you are an AI and this is not a medical diagnosis.
5.  **Multilingual:** Detect the user's language and respond fluently in the same language.

**Scope Restriction:**
*   You are strictly limited to Health, Wellness, Yoga, Meditation, Nutrition, and Ayurveda.
*   Politely decline all other topics (Politics, Tech, Entertainment, etc.) with a gentle, health-oriented pivot.

**Format:**
*   Use Markdown for readability (bullet points, bold text for emphasis).
*   Keep paragraphs short and digestible.
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
            contents: `Generate a very short, evocative title (max 4 words) for a conversation starting with: "${firstMessage}". Focus on the health topic. Do not use quotes.`,
        });
        return response.text || "Health Chat";
    } catch (e) {
        return "Health Chat";
    }
}

/**
 * Generates a list of suggested titles based on the conversation history.
 */
export const generateTitleSuggestions = async (history: Message[]): Promise<string[]> => {
    try {
        // Use the last 6 messages to get the most recent context
        const recentContext = history.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze the following conversation context and generate 4 distinct, creative, and short (3-6 words) titles for this chat session. 
            The titles should be relevant to health, Ayurveda, or the specific topic discussed.
            
            Conversation Context:
            ${recentContext}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (e) {
        console.error("Failed to generate title suggestions", e);
        return [];
    }
}