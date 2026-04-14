const fs = require('fs');
let envStr = "";
try { envStr = fs.readFileSync('.env.local', 'utf8'); } catch (e) {}

let apiKey = "";
const match = envStr.match(/GOOGLE_API_KEY=(.*)/);
if (match && match[1]) apiKey = match[1].trim();

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  console.log(data.models.map(m => m.name).join("\n"));
}
run();
