const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateResponse(resumeText) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert resume reviewer. Provide clear, concise, and actionable feedback.' },
      { role: 'user', content: resumeText },
    ],
  });

  return response.choices[0].message.content.trim();
}

module.exports = { generateResponse };
