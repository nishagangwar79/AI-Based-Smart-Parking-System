import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

export const generateAIResponse = async (prompt, systemContext = '') => {
  const ai = getGenAI();

  if (!ai) {
    return null;
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = systemContext
      ? `${systemContext}\n\nUser Request:\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return null;
  }
};

export const isGeminiAvailable = () => {
  return !!getGenAI();
};

export default { generateAIResponse, isGeminiAvailable };
