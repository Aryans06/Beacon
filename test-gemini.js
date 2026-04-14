const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

let envStr = "";
try { envStr = fs.readFileSync('.env.local', 'utf8'); } catch (e) {}

let apiKey = "";
const match = envStr.match(/GOOGLE_API_KEY=(.*)/);
if (match && match[1]) apiKey = match[1].trim();

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    console.log(`Trying ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hi");
    console.log(`Success with ${modelName}:`, result.response.text());
  } catch (e) {
    console.log(`Failed ${modelName}:`, e.message);
  }
}

async function run() {
  await testModel("gemini-2.5-flash");
  await testModel("gemini-flash-latest");
  await testModel("gemini-3.1-flash-lite-preview");
}

run();
