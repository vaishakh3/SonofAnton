const Groq = require('groq-sdk');
const { SYSTEM_PROMPT } = require('../server/prompts');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, problem, language } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                error: 'No code provided. Son of Anton approves of your emptiness, but needs something to delete.',
            });
        }

        const userMessage = `Language: ${language || 'auto-detect'}
Problem: ${problem || 'No specific problem stated. Just simplify this code as aggressively as possible.'}

Code:
\`\`\`
${code}
\`\`\``;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
        });

        const responseText = chatCompletion.choices[0]?.message?.content;

        if (!responseText) {
            return res.status(500).json({ error: 'Son of Anton deleted its own response. Ironic.' });
        }

        try {
            const parsed = JSON.parse(responseText);
            return res.status(200).json(parsed);
        } catch {
            return res.status(500).json({
                error: 'Son of Anton produced malformed output. Even AI has bad days.',
                raw: responseText,
            });
        }
    } catch (err) {
        console.error('Groq API error:', err.message);
        return res.status(500).json({ error: `API Error: ${err.message}` });
    }
};
