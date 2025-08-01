const express=require("express");
const model=require("./geminiconnect.js");
const gmail=require("./gmailapi.js");
const bodyParser = require('body-parser');

const app=express()
port=3000;
app.use(bodyParser.json());

//gemini part here
app.post('/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
    console.log(response.text)
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(port,console.log(`listening at ${port}`))