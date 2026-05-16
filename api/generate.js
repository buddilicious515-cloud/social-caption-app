export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea, tone, niche } = req.body;
  if (!idea) return res.status(400).json({ error: 'Missing idea' });
  const prompt = `You are an expert social media copywriter. Create optimized posts for all 5 platforms.\n\nPost idea: "${idea}"\nTone: ${tone || "Inspirational"}\nNiche/Topic: ${niche || "general"}\n\nRespond ONLY with valid JSON, no markdown:\n{\n  "instagram": { "caption": "...", "hashtags": "#tag1 #tag2 ..." },\n  "facebook": { "caption": "...", "hashtags": "#tag1 #tag2 ..." },\n  "twitter": { "caption": "..." },\n  "linkedin": { "caption": "...", "hashtags": "#tag1 #tag2 ..." },\n  "tiktok": { "caption": "...", "hashtags": "#tag1 #tag2 ..." }\n}\nRules:\n- Instagram: engaging, emoji-rich, 5-30 hashtags\n- Facebook: conversational, 2-5 hashtags\n- Twitter/X: under 240 chars\n- LinkedIn: professional, 3-5 hashtags\n- TikTok: trendy, hook first, 5-10 hashtags`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1500, temperature: 0.7, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
