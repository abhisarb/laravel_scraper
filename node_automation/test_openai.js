require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
    try {
        const list = await openai.models.list();
        console.log("Success! Key works.");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

test();
