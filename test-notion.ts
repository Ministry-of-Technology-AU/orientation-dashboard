require('dotenv').config({ path: '.env.local' });
const { getGuidesMeta } = require('./src/lib/notion.ts');

async function run() {
  try {
    const meta = await getGuidesMeta();
    console.log("Success:", meta);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
