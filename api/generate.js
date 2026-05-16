export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea, tone, niche } = req.body;
  if (!idea) return res.status(400).json({ error: 'Missing idea' });
  const prompt = `You are an expert social media copywriter. Create optimized posts for all 5 platforms.\n\nPost idea: "${idea}"\nTone: ${tone || "Inspirational"}\nNiche/Topic: ${niche || "general"}\n\nRespond ONLY with valid JSON, no markdown:\n{\n  "instagram": { "caption": "...", "hashtags": "#tag1 #tag2 ..." },\n  "facebook": { "caption": "...", "hashtags": "#tag1 #tag2 ..." },\n  "twitter": { "caption": "..." },\n  "linkedin": { "caption": "...", "hashtags": "#tag1 #tag2 ..." },\n  "tiktok": { "caption": "...", "hashtags": "#tag1 #tag2 ..." }\n}\nRules:\n- Instagram: engaging, emoji-rich, storytelling, 5-30 hashtags\n- Facebook: conversational, longer, 2-5 hashtags\n- Twitter/X: punchy, under 240 chars\n- LinkedIn: professional, value-driven, 3-5 hashtags\n- TikTok: trendy, energetic, hook in first line, 5-10 hashtags`;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');
    const raw = data.content?.find(b => b.type === 'text')?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
