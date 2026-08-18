import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Initialize the model with Google Search Grounding to fetch real-time location data
const getGroundedModel = (context) => {
  if (!genAI) throw new Error('Missing Gemini API Key in .env file.');

  let instruction = 'You are an expert travel advisor AI built directly into the Travel Advisor application. '
    + 'You MUST provide highly specific, location-aware answers based on the user\'s current state in the app. '
    + 'Use your Google Grounding tools to find the best routes, restaurants, hotels, and attractions. '
    + 'Keep your answers concise, formatted in markdown, and highly enthusiastic! ';

  if (context) {
    const { coords, locationName, places } = context;
    if (coords && coords.lat && coords.lng) {
      instruction += `\n\nCRITICAL CONTEXT: The user is currently physically located at Latitude: ${coords.lat}, Longitude: ${coords.lng}`;
      if (locationName) instruction += ` (City: ${locationName})`;
      instruction += '. If they ask for directions, routing, or "near me", you MUST calculate it starting exactly from these coordinates!';
    }
    if (places && places.length > 0) {
      const placeNames = places.slice(0, 10).map((p) => p.name).join(', ');
      instruction += `\n\nThe user is currently looking at a map displaying these places: ${placeNames}.`;
    }
  }

  return genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    tools: [
      {
        googleSearch: {},
      },
    ],
    systemInstruction: instruction,
  });
};

export const startTravelChat = (context) => {
  const model = getGroundedModel(context);
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
