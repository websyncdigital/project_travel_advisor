import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Initialize the model with Google Search Grounding to fetch real-time location data
const getGroundedModel = () => {
  if (!genAI) throw new Error('Missing Gemini API Key in .env file.');

  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [
      {
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: 'MODE_DYNAMIC',
            dynamicThreshold: 0.3,
          },
        },
      },
    ],
    systemInstruction:
      'You are an expert travel advisor AI built into a map application. '
      + 'Use your Google Grounding tools to find the best restaurants, hotels, and attractions. '
      + 'Keep your answers concise, formatted in markdown, and highly enthusiastic! '
      + 'If asked about a location, always try to provide specific real-world recommendations.',
  });
};

export const startTravelChat = () => {
  const model = getGroundedModel();
  return model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: 'Hello! I am looking for travel recommendations.' }],
      },
      {
        role: 'model',
        parts: [{ text: "Hello! I am your AI Travel Advisor. I am connected to Google's Grounding data, so I can find the best real-time spots for you anywhere in the world! Where are we exploring today?" }],
      },
    ],
  });
};
