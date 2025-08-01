const axios = require("axios");
require('dotenv').config();

const llmMiddleware = async (req, res, next) => {
  const inputText = req.body.input;

  if (!inputText) {
    return res.status(400).json({ error: "Missing 'input' in request body." });
  }

  try {
    console.log("API KEY:", process.env.OPENROUTER_API_KEY);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4.1-nano", 
        messages: [
          { role: "system", content: "You are an OSINT analyst." },
          { role: "user", content: inputText }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    req.llmResponse = response.data.choices[0].message.content;
    next();
  } catch (err) {
  console.error("LLM error:", err?.response?.data || err.message);
  return res.status(500).json({
    error: "Failed to contact LLM API.",
    details: err?.response?.data || err.message
  });
}

  }

module.exports = llmMiddleware;
