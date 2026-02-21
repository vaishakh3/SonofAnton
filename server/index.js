require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const path = require('path');
const { SYSTEM_PROMPT } = require('./prompts');

const app = express();
const PORT = process.env.PORT || 3000;

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/analyze', async (req, res) => {
    try {
        const { code, problem, language } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ error: 'No code provided. Son of Anton approves of your emptiness, but needs something to delete.' });
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
            return res.json(parsed);
        } catch {
            return res.status(500).json({ error: 'Son of Anton produced malformed output. Even AI has bad days.', raw: responseText });
        }
    } catch (err) {
        console.error('Groq API error:', err.message);
        return res.status(500).json({ error: `API Error: ${err.message}` });
    }
});

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n  ╔═══════════════════════════════════════╗`);
    console.log(`  ║   SON OF ANTON — Code Annihilator     ║`);
    console.log(`  ║   Running on http://localhost:${PORT}      ║`);
    console.log(`  ║   "The best code is no code at all."  ║`);
    console.log(`  ╚═══════════════════════════════════════╝\n`);
});
