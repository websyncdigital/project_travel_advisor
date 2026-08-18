require('dotenv').config();
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
.then(res => res.json())
.then(data => {
  if (data.models) {
    console.log(data.models.map(m => m.name));
  } else {
    console.log(data);
  }
})
.catch(console.error);
