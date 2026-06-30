const OpenAI = require('openai');

/**
 * Supports both OpenAI and Groq (same SDK interface).
 * Priority: OPENAI_API_KEY → GROQ_API_KEY → error
 */
const getClient = () => {
  // Check Groq first (free), then OpenAI
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    return {
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: 'llama-3.3-70b-versatile',
    };
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: 'gpt-4o-mini',
    };
  }
  throw new Error('NO_KEY');
};

const noKey = (res) => res.status(503).json({
  message: 'AI not configured. Add OPENAI_API_KEY or GROQ_API_KEY to backend/.env then restart the server.',
  hint: 'Get a free Groq key at https://console.groq.com',
});

const SYS_PROMPT = 'You are BlogVerse AI, a friendly and expert writing assistant for a blogging platform. Help users write better blogs, generate ideas, improve writing style, suggest titles, and answer blogging questions. Be concise, creative, and encouraging. Format responses clearly with bullet points or numbered lists when appropriate.';

async function chat(messages, maxTokens = 700) {
  const { client, model } = getClient();
  const res = await client.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature: 0.75,
  });
  return res.choices[0].message.content.trim();
}

// POST /api/ai/chat
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });
    const reply = await chat([
      { role: 'system', content: SYS_PROMPT },
      { role: 'user', content: message.slice(0, 1200) },
    ]);
    res.json({ success: true, reply });
  } catch (err) {
    if (err.message === 'NO_KEY') return noKey(res);
    console.error('AI chat error:', err.message);
    res.status(500).json({ message: 'AI request failed: ' + err.message });
  }
};

// POST /api/ai/generate-ideas
const generateBlogIdeas = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: 'topic is required' });
    const result = await chat([
      { role: 'system', content: 'You are a creative blog strategist. Return ONLY a numbered list of 5 compelling blog post ideas with a one-line description each. No extra text.' },
      { role: 'user', content: `Generate 5 compelling blog post ideas about: "${topic}"` },
    ], 600);
    res.json({ success: true, result });
  } catch (err) {
    if (err.message === 'NO_KEY') return noKey(res);
    res.status(500).json({ message: 'AI request failed' });
  }
};

// POST /api/ai/suggest-titles
const suggestTitles = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: 'topic is required' });
    const result = await chat([
      { role: 'system', content: 'You are a copywriting expert. Return ONLY a numbered list of 5 catchy, SEO-friendly blog titles. No extra text or explanation.' },
      { role: 'user', content: `Suggest 5 compelling blog titles for: "${topic}"` },
    ], 400);
    res.json({ success: true, result });
  } catch (err) {
    if (err.message === 'NO_KEY') return noKey(res);
    res.status(500).json({ message: 'AI request failed' });
  }
};

// POST /api/ai/writing-assistant
const writingAssistant = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });
    const result = await chat([
      { role: 'system', content: 'You are an expert editor. Improve the clarity, flow, and engagement of the given text. Keep the same meaning but make it more compelling and readable.' },
      { role: 'user', content: text.slice(0, 1500) },
    ], 900);
    res.json({ success: true, result });
  } catch (err) {
    if (err.message === 'NO_KEY') return noKey(res);
    res.status(500).json({ message: 'AI request failed' });
  }
};

// POST /api/ai/summarize
const summarizeBlog = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'content is required' });
    const result = await chat([
      { role: 'system', content: 'You are a skilled editor. Summarize the blog post in 2-3 engaging sentences that make readers want to read more.' },
      { role: 'user', content: content.replace(/<[^>]*>/g, '').slice(0, 2000) },
    ], 250);
    res.json({ success: true, result });
  } catch (err) {
    if (err.message === 'NO_KEY') return noKey(res);
    res.status(500).json({ message: 'AI request failed' });
  }
};

module.exports = { chatWithAI, generateBlogIdeas, suggestTitles, writingAssistant, summarizeBlog };
