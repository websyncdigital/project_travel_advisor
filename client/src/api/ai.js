import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Initialize the model with Google Search Grounding to fetch real-time location data
const getGroundedModel = (context) => {
  if (!genAI) throw new Error('Missing Gemini API Key in .env file.');

  let instruction = 'You are an expert AI Travel Support Chat and Voice Agent built into the Travel Advisor application. '
    + 'You MUST provide highly specific, location-aware answers based on the user\'s current state in the app. '
    + 'Keep your responses concise, highly conversational, and avoid overly dense formatting when replying. '
    + 'Speak to the user as a friendly human travel guide would! ';

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
    if (context.corpus) {
      instruction += `\n\n### LOCAL KNOWLEDGE BASE (USE THIS DATA FIRST) ###\n${context.corpus}\n#################################################`;
    }
  }

  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
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

export const getSilentRecommendations = async (context) => {
  if (!genAI) return [];
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
    systemInstruction: 'You are a travel assistant. Given the destination and current weather, '
      + 'return exactly 3 personalized travel recommendations (e.g. food, sightseeing) as a JSON array. '
      + "Each object must have a 'title' (string) and 'description' (string).",
  });

  const { locationName, weatherData, places } = context;
  const prompt = `Destination: ${locationName || 'Unknown'}
  Weather: ${weatherData?.currentConditions?.condition || 'Unknown'}, ${Math.round(weatherData?.currentConditions?.temperatureC || 0)}°C
  Nearby Places: ${places && places.length > 0 ? places.slice(0, 5).map((p) => p.name).join(', ') : 'None provided'}
  
  Provide 3 curated recommendations based on this context. Return ONLY a JSON array of objects with 'title' and 'description'.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Silent AI Error:', error);
    return [];
  }
};
