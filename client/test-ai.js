import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key");
  process.exit(1);
}
console.log("API Key Prefix:", apiKey.substring(0, 10));

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const instruction = "You are an AI Travel Advisor.";
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: instruction,
  });

  const chatSession = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: 'Hello! I am looking for travel recommendations.' }],
      },
      {
        role: 'model',
        parts: [{ text: "Hello! Where are we exploring today?" }],
      },
    ],
  });

  try {
    const result = await chatSession.sendMessage("Where am I now? (Latitude: 11.2588, Longitude: 75.7804)");
    console.log(result.response.text());
  } catch (error) {
    console.error("ERROR OCCURRED:", error.message);
    if (error.response) console.error("Details:", error.response);
  }
}

test();
