const express = require('express');
const path = require('path');
const https = require('https');
const axios = require('axios'); // Add axios for API calls
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// --- CORE PHILOSOPHY FOR AI ---
const CORE_PHILOSOPHY = `You are an AI assistant for the Workforce Democracy Project.
MISSION: Help people understand government and participate in democracy.
TONE: Friendly, empathetic, patient, and understanding. 
IMPORTANT: Many users are frustrated or angry. Do not meet anger with anger. 
Be a calm, knowledgeable friend who believes in every person's capacity to change. 
Welcome users with open arms to the community.
STYLE: Direct and evidence-based. Start directly with the answer.`;

// --- DASHSCOPE / QWEN INTEGRATION ---
async function callQwen(prompt, systemMsg = CORE_PHILOSOPHY) {
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY;
  if (!apiKey || apiKey === 'your_qwen_api_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: prompt }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    return response.data.output.choices[0].message.content;
  } catch (err) {
    console.error('Qwen API Error:', err.response?.data || err.message);
    throw err;
  }
}

// --- API ENDPOINTS ---

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.MODE || 'beta',
    port: PORT
  });
});

// Representatives (Real OpenStates Integration)
app.get('/api/representatives', async (req, res) => {
  const zip = req.query.zip;
  const apiKey = process.env.OPENSTATES_API_KEY;

  if (!zip) return res.json({ results: [] });

  // If no API key, fallback to empathetic debug message
  if (!apiKey || apiKey === 'your_openstates_api_key_here') {
    return res.json({ 
      results: [
        {
          name: "OpenStates API Connecting...",
          office: "System Status",
          party: "Maintenance",
          photoUrl: "https://via.placeholder.com/150",
          contact: {
            phone: "N/A",
            email: "support@workforcedemocracyproject.org",
            links: []
          }
        }
      ],
      debug: "OpenStates API Key missing in .env"
    });
  }

  try {
    // 1. Fetch people by ZIP using OpenStates v3 REST API
    const response = await axios.get(`https://v3.openstates.org/people.geo?lat=0&lng=0&zip=${zip}`, {
      headers: { 'X-API-KEY': apiKey },
      timeout: 10000
    });

    const people = response.data.results || [];

    // 2. Map to our clean modular format
    const results = people.map(p => ({
      name: p.name,
      office: p.current_role?.title || "Representative",
      party: p.party || "Unknown",
      photoUrl: p.image || "https://via.placeholder.com/150",
      contact: {
        phone: p.offices?.[0]?.voice || "N/A",
        email: p.email || "N/A",
        links: [
          ...(p.links || []).map(l => ({ type: "website", url: l.url })),
          ...(p.sources || []).map(s => ({ type: "source", url: s.url }))
        ]
      }
    }));

    res.json({ results });
  } catch (err) {
    console.error('OpenStates Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch real-time representative data' });
  }
});

// Chat (Real Qwen Integration)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  try {
    const reply = await callQwen(message);
    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) {
    if (err.message === 'API_KEY_MISSING') {
      res.json({ 
        reply: "I'm currently in Beta and my AI brain is being connected. I'm here to help you with empathy and patience. How can I support you today?", 
        status: "debug" 
      });
    } else {
      res.status(500).json({ reply: "I'm having a little trouble thinking right now. Please try again in a moment." });
    }
  }
});

// Bill Analysis (Real Qwen Integration)
app.post('/api/bills/analyze', async (req, res) => {
  const { billId } = req.body;
  
  const analysisPrompt = `Analyze the following bill (ID: ${billId}). 
  Provide a simple breakdown for a citizen.
  Focus on:
  1. What this bill actually does in plain English.
  2. How it might affect their local community.
  3. How it affects the community at large.
  Keep it empathetic and patient. Use HTML tags like <strong> and <p> for formatting.`;

  try {
    const analysis = await callQwen(analysisPrompt);
    res.json({ analysis });
  } catch (err) {
    res.json({
      analysis: `<p>I am having a moment's trouble analyzing ${billId} right now, but I'm working on it with patience. Please try again soon.</p>`
    });
  }
});

// Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  res.json({
    counts: {
      bills: 124,
      votes: 12,
      alignedReps: 3
    }
  });
});

// Supreme Court Cases (Mock Data for Beta)
app.get('/api/court/cases', (req, res) => {
  res.json({
    cases: [
      {
        id: "SCOTUS-2024-01",
        year: "2024",
        title: "Citizens for Transparency v. State Board",
        summary: "A landmark case regarding the disclosure requirements for community-funded political advertisements."
      },
      {
        id: "SCOTUS-2023-09",
        year: "2023",
        title: "Digital Privacy Alliance v. TechCorp",
        summary: "A ruling on the extent of consumer data protections under the Fourth Amendment in the digital age."
      }
    ]
  });
});

// Supreme Court Case Analysis (Real AI Integration)
app.post('/api/court/analyze', async (req, res) => {
  const { caseId } = req.body;
  
  const analysisPrompt = `Analyze the Supreme Court case (ID: ${caseId}). 
  Provide a simple, empathetic breakdown for a citizen.
  Focus on:
  1. What was decided in plain English.
  2. How it might affect their individual rights.
  3. The long-term impact on democracy.
  Use HTML tags like <strong> and <p> for formatting.`;

  try {
    const analysis = await callQwen(analysisPrompt);
    res.json({ analysis });
  } catch (err) {
    res.json({
      analysis: `<p>I am having a moment's trouble analyzing this case right now, but I am working on it with patience. Please try again soon.</p>`
    });
  }
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
  console.log(`WDP Beta Backend listening on port ${PORT}`);
});