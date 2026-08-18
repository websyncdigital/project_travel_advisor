const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

if (!apiKey) {
  console.log("No API key found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    const chatSession = model.startChat({});
    console.log("Sending message...");
    const result = await chatSession.sendMessage("List all the restaurants near Kozhikode");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
