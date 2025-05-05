const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const generationConfig = {
      temperature: 0.9,
      topP: 1,
      topK: 32,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ];

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: question }] }],
      generationConfig,
      safetySettings,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });

  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({
      error: error.message || 'API request failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
