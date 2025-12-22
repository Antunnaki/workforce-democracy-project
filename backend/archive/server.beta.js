const express = require('express');
const path = require('path');
const https = require('https');
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

// Representatives (Anonymous ZIP-based search)
app.get('/api/representatives', (req, res) => {
  const zip = req.query.zip;
  if (!zip) {
    return res.json({ results: [] });
  }

  // Placeholder for real OpenStates/Google Civic integration
  res.json({
    results: [
      {
        name: "Sample Representative",
        office: "State House District 1",
        party: "Democratic",
        photoUrl: "https://via.placeholder.com/150",
        contact: {
          phone: "555-0199",
          email: "rep@example.gov",
          links: [{ type: "website", url: "https://example.gov" }]
        }
      }
    ]
  });
});

// Chat (Empathetic Civic Assistant)
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.QWEN_API_KEY;

  if (!apiKey || apiKey === 'your_qwen_api_key_here') {
    return res.json({ 
      reply: "I'm currently in Beta and my AI brain is being connected. I'm here to help you with empathy and patience. What would you like to know about democracy today?", 
      status: "debug" 
    });
  }

  // Qwen/DashScope logic will be implemented here in next step
  res.json({ 
    reply: `[Beta] I heard you say: "${message}". I am here to help with empathy and patience as we build this together.`,
    timestamp: new Date().toISOString()
  });
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

// Bill Analysis (AI-driven)
app.post('/api/bills/analyze', (req, res) => {
  const { billId } = req.body;
  
  // Placeholder logic for AI analysis
  // In a real scenario, this would fetch bill text from an API and send to LLM
  res.json({
    analysis: `
      <div style="margin-bottom:12px;">
        <strong>Community Impact:</strong> This bill proposes significant investment in local parks, which researchers show improves community mental health and property values.
      </div>
      <div>
        <strong>The Big Picture:</strong> HR 1234 is part of a larger national effort to modernize urban infrastructure. It aims to reduce carbon footprints by 15% over the next decade.
      </div>
      <p style="margin-top:12px; font-style:italic; font-size:0.8rem; opacity:0.8;">
        "I understand legislation can be complex. My goal is to help you see how these changes touch your daily life with patience and clarity."
      </p>
    `
  });
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
  console.log(`WDP Beta Backend listening on port ${PORT}`);
});