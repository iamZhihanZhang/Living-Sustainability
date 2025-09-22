
'use strict';
const OpenAI = require('openai');

/**
 * Takes in a prompt and uses the prompt for OpenAI API, and returns the result of the prompt.
 * @param {String} prompt The prompt
 * @param {String} model The LLM model, default is gpt-4o-mini
 * @returns
 */
async function getCompletion(prompt, context, model = "gpt-4o-mini") {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: context },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });
    console.log(response.usage)

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching completion from OpenAI:', error);
    return 'Error occurred while getting completion.';
  }
}

module.exports = { getCompletion }