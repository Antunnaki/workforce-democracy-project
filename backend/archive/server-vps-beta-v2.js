const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS is handled by Nginx to prevent duplicate headers
app.use(express.json());

// 2. AI Service Integration
const { analyzeWithAI, generateCompassionateFallback } = require('./ai-service-qwen');

// 3. API Endpoints

// Main Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, context = 'general', conversationHistory = [] } = req.body;
    console.log('🤖 AI Chat Request: ' + (message ? message.substring(0, 50) : 'null') + '...');

    try {
        const result = await analyzeWithAI(message, { conversationHistory }, context);

        if (!result.success) {
            return res.json({
                success: true,
                reply: generateCompassionateFallback(message, context),
                message: generateCompassionateFallback(message, context),
                fallback: true
            });
        }

        res.json({
            success: true,
            reply: result.response,
            message: result.response,
            response: result.response,
            sources: result.sources || []
        });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to process AI request' });
    }
});

// Alias for /api/civic/llm-chat
app.post('/api/civic/llm-chat', (req, res, next) => {
    req.url = '/api/chat';
    app.handle(req, res, next);
});

// Dashboard Stats
app.get('/api/dashboard', (req, res) => {
    res.json({
        success: true,
        counts: {
            bills: 124,
            votes: 12,
            alignedReps: 3
        }
    });
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: 'beta-v1.0.2' });
});

// 4. Start Server
app.listen(PORT, () => {
    console.log('🚀 WDP Beta Backend listening on port ' + PORT);
});
