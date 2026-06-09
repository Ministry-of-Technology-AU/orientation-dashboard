require('dotenv').config({ path: '.env.local' });
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function run() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_GUIDES_DB_ID,
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
    });
    
    if (response.results.length > 0) {
      console.log("Found page ID:", response.results[0].id);
      console.log("Properties:", JSON.stringify(response.results[0].properties, null, 2));
    } else {
      console.log("No published guides found.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
