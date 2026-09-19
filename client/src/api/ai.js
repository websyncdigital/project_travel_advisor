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

export const getSilentRecommendations = async (context) => {
  if (!genAI) return [];

  const { locationName, weatherData, places } = context;

  if (!places || places.length === 0) return [];

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
    systemInstruction: 'You are a travel assistant. Given the context and a list of nearby places, '
      + 'select the top 3 best matching places. '
      + 'Return a JSON array of EXACT place names that you recommend.',
  });

  // Provide the first 15 places to choose from
  const availablePlaces = places.slice(0, 15).map((p) => p.name).join(', ');

  const prompt = `Destination: ${locationName || 'Unknown'}
  Weather: ${weatherData?.currentConditions?.condition || 'Unknown'}, ${Math.round(weatherData?.currentConditions?.temperatureC || 0)}°C
  Available Places to Choose From: ${availablePlaces}
  
  Provide exactly 3 curated recommendations from the "Available Places" list based on the weather and destination. Return ONLY a JSON array of strings, where each string is the exact name of the place.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const recommendedNames = JSON.parse(text);

    // Map the returned names back to actual place objects
    const recommendedPlaces = recommendedNames
      .map((name) => places.find((p) => p.name === name))
      .filter((p) => p !== undefined);

    return recommendedPlaces;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Silent AI Error:', error);
    return [];
  }
};

export const sendMultimodalMessage = async (text, base64Data, mimeType, historyContext) => {
  if (!genAI) throw new Error('Missing Gemini API Key in .env file.');

  // Use standard model without grounding tools, as grounding is not supported with images
  const visionModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const promptParts = [
    { text: `Conversation History:\n${historyContext}\n\nUser Request: ${text}` },
  ];

  if (base64Data) {
    promptParts.push({
      inlineData: {
        data: base64Data.split(',')[1] || base64Data, // ensure pure base64 without data URL prefix
        mimeType: mimeType || 'image/jpeg',
      },
    });
  }

  const result = await visionModel.generateContent(promptParts);
  return result.response.text();
};

export const generateAiSuggestions = (placesList, categoryType = 'restaurants', location = 'Kunnamangalam', aiPicks = []) => {
  if (!placesList || placesList.length === 0) return [];

  const analyzed = placesList.map((place, index) => {
    const rating = Number(place.rating) || 0;
    const reviews = Number(place.num_reviews || place.user_ratings_total) || 0;
    const priceLevel = place.price_level !== undefined && place.price_level !== null ? Number(place.price_level) : null;
    const isAiPicked = Boolean(aiPicks && aiPicks.some((pick) => pick.name === place.name || (pick.place_id && pick.place_id === place.place_id)));

    // 1. Rating score (0 - 45 points)
    const ratingScore = rating > 0 ? (rating / 5.0) * 45 : 20;

    // 2. Review volume confidence score (0 - 30 points)
    const reviewScore = reviews > 0 ? Math.min(30, Math.log10(reviews + 1) * 8.5) : 5;

    // 3. Price-to-quality & value score (0 - 15 points)
    let priceScore = 10;
    let priceLabel = '';
    if (priceLevel === 1) {
      priceScore = 15;
      priceLabel = 'budget-friendly ($)';
    } else if (priceLevel === 2) {
      priceScore = 13;
      priceLabel = 'great value ($$)';
    } else if (priceLevel === 3) {
      priceScore = 9;
      priceLabel = 'upscale ($$$)';
    } else if (priceLevel >= 4) {
      priceScore = 7;
      priceLabel = 'premium ($$$$)';
    }

    // 4. Service & operational reliability score (0 - 10 points)
    const serviceScore = (place.opening_hours?.open_now ? 3 : 1)
      + (place.photos && place.photos.length > 0 ? 3 : 0)
      + (isAiPicked ? 4 : 2);

    const rawTotal = ratingScore + reviewScore + priceScore + serviceScore;
    const aiMatchScore = Math.min(99, Math.max(75, Math.round(rawTotal)));

    // AI Badge determination
    let aiBadge = '🎯 AI Recommended';
    if (isAiPicked) {
      aiBadge = '✨ Gemini AI Top Pick';
    } else if (rating >= 4.0 && reviews >= 300) {
      aiBadge = '⭐ Top Rated & Most Popular';
    } else if (rating >= 4.3) {
      aiBadge = '🌟 Exceptional Quality';
    } else if (priceScore >= 12 && rating >= 3.8) {
      aiBadge = '💎 Best Value for Money';
    } else if (reviews >= 100) {
      aiBadge = '🔥 Community Favorite';
    }

    // Category-specific AI analysis explanation factoring in ratings, reviews, price-to-quality, and service
    let analysisExplanation = '';
    const ratingText = rating > 0 ? `${rating.toFixed(1)}★ rating` : 'favorable feedback';
    const reviewsText = reviews > 0 ? `${reviews.toLocaleString()} verified reviews` : 'local visitor listings';
    const priceText = priceLabel ? ` with ${priceLabel}` : '';

    const catKey = (categoryType || '').toLowerCase();
    if (catKey.includes('restaurant') || catKey.includes('cafe') || catKey.includes('bar') || catKey.includes('coffee')) {
      analysisExplanation = `Analyzed ${ratingText} across ${reviewsText}${priceText}. Highly rated for food quality, dependable service, and great value in ${location}.`;
    } else if (catKey.includes('hotel') || catKey.includes('lodging')) {
      analysisExplanation = `Evaluated ${ratingText} backed by ${reviewsText}${priceText}. Top recommendation for guest satisfaction, attentive service, and comfort.`;
    } else if (catKey.includes('attraction') || catKey.includes('things to do') || catKey.includes('museum')) {
      analysisExplanation = `Scored ${ratingText} with ${reviewsText}. Outstanding visitor satisfaction index for activities, service, and sightseeing.`;
    } else if (catKey.includes('pharmacy') || catKey.includes('hospital')) {
      analysisExplanation = `Verified ${ratingText} and ${reviewsText}. High community trust rating, reliable service, and medical care in ${location}.`;
    } else if (catKey.includes('atm') || catKey.includes('bank')) {
      analysisExplanation = `Rated ${ratingText} across ${reviewsText}. Excellent accessibility, operational reliability, and dependable banking service.`;
    } else if (catKey.includes('gas') || catKey.includes('parking')) {
      analysisExplanation = `Calculated ${ratingText} from ${reviewsText}${priceText}. Prompt service rating, clean amenities, and high commuter dependability.`;
    } else if (catKey.includes('grocer') || catKey.includes('supermarket') || catKey.includes('post')) {
      analysisExplanation = `Assessed ${ratingText} across ${reviewsText}. Strong local community recommendations for product freshness, convenience, and service.`;
    } else {
      analysisExplanation = `AI evaluated ${ratingText} and ${reviewsText}${priceText}. Top performance across quality, value, and service metrics.`;
    }

    return {
      ...place,
      originalIndex: index,
      aiMatchScore,
      aiBadge,
      aiAnalysis: analysisExplanation,
      sortScore: rawTotal,
    };
  });

  // Sort by AI score descending and display ONLY the top 5 AI suggestions
  analyzed.sort((a, b) => b.sortScore - a.sortScore);
  return analyzed.slice(0, 5);
};
