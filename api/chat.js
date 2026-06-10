export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, systemPrompt } = req.body;
  const GROQ_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_KEY) return res.status(500).json({ error: 'Clé API manquante côté serveur' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'Tu es un assistant vocal sympa et concis. Réponds toujours en français, en phrases courtes adaptées à la synthèse vocale. Pas de markdown ni de listes, juste du texte naturel.'
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const reply = data.choices?.[0]?.message?.content || 'Pas de réponse.';
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur : ' + e.message });
  }
}
