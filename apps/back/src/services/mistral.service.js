const { Mistral } = require('@mistralai/mistralai');

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function testMistral() {
  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: 'Dis juste bonjour' }],
  });
  console.log(response.choices[0].message.content);
}

module.exports = {
  testMistral,
};