# FAQ LLM Integration Guide - Ethical & Cost-Effective

**Version:** V32.8.6  
**Status:** 🔄 Ready for Backend Implementation  
**Priority:** When backend infrastructure is available

---

## 🎯 Overview

This guide explains how to integrate LLM (Large Language Model) functionality into the FAQ chat widgets using **ethical, cost-effective providers** (NO Grok, NO big tech monopolies).

---

## 🏗️ Current Architecture

### Frontend Implementation (Already Complete ✅)

The FAQ page currently has:
1. **12 FAQs** with individual chat widgets
2. **Chat history** stored in localStorage (encrypted AES-256-GCM)
3. **Per-question context** - each FAQ has its own isolated chat
4. **User input interface** - textarea + send button
5. **Message display** - user/assistant message bubbles

### Backend Integration Points (Needs Implementation)

Currently, the `sendFAQMessage()` function shows a placeholder response:
```javascript
// js/faq-new.js - Line ~1150
function sendFAQMessage(faqId) {
    // ...existing code...
    
    // TODO: Replace with actual LLM API call
    const assistantMessage = {
        role: 'assistant',
        content: "I'm here to help! This chat widget will be connected to an AI assistant soon. For now, please explore the FAQ answer above or try the search function.",
        timestamp: Date.now()
    };
}
```

---

## 🌿 Ethical LLM Providers (Recommended)

### 1. **Groq (Top Recommendation)**

**Why Groq:**
- ✅ Independent company (not big tech)
- ✅ **Extremely fast** inference (< 1 second responses)
- ✅ **Cost-effective** ($0.05-$0.10 per million tokens)
- ✅ Open-source models (Llama 3, Mixtral)
- ✅ Privacy-focused

**API Endpoint:**
```
https://api.groq.com/openai/v1/chat/completions
```

**Cost:** ~$0.10 per 1M tokens (Llama 3 8B)

**Example Request:**
```javascript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant explaining workplace democracy...'
            },
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ],
        temperature: 0.7,
        max_tokens: 500
    })
});
```

### 2. **Together.ai (Alternative)**

**Why Together.ai:**
- ✅ Ethical AI cooperative
- ✅ Open-source models
- ✅ Competitive pricing
- ✅ Good performance

**Cost:** ~$0.20 per 1M tokens

**API Endpoint:**
```
https://api.together.xyz/v1/chat/completions
```

### 3. **Replicate (Budget Option)**

**Why Replicate:**
- ✅ Pay-per-use model
- ✅ Open-source models
- ✅ Very cost-effective for low volume
- ✅ No minimum commitment

**Cost:** ~$0.05-$0.15 per 1M tokens (varies by model)

---

## 🚫 Providers to AVOID

Per user request: **NO Grok, NO big tech companies**

❌ **OpenAI** - Big tech, expensive, monopolistic  
❌ **Grok (X.AI)** - Explicitly forbidden by user  
❌ **Google (Gemini)** - Big tech monopoly  
❌ **Anthropic (Claude)** - Backed by big tech  
❌ **Amazon (Bedrock)** - Big tech monopoly  

---

## 🔧 Implementation Steps

### Step 1: Backend API Endpoint

Create a backend endpoint that handles FAQ chat requests:

```python
# Example: Python Flask backend
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

@app.route('/api/faq-chat', methods=['POST'])
def faq_chat():
    data = request.json
    faq_id = data.get('faqId')
    faq_context = data.get('faqContext')  # The FAQ question + answer
    messages = data.get('messages')  # Conversation history
    
    # Build system prompt with FAQ context
    system_prompt = f"""You are a helpful assistant for the Workforce Democracy Project FAQ system.

Context - User is reading this FAQ:
Question: {faq_context['question']}
Answer Summary: {faq_context['answer'][:500]}...

Your role:
1. Answer follow-up questions about workplace democracy
2. Reference the FAQ content when relevant
3. Be warm, encouraging, and non-partisan
4. Keep responses concise (2-3 paragraphs max)
5. If asked about implementation, emphasize local community organization

Tone: Conversational, supportive, educational"""
    
    # Prepare messages for Groq
    groq_messages = [
        {'role': 'system', 'content': system_prompt}
    ] + messages
    
    # Call Groq API
    response = requests.post(
        GROQ_API_URL,
        headers={
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'llama3-8b-8192',
            'messages': groq_messages,
            'temperature': 0.7,
            'max_tokens': 500
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        assistant_message = result['choices'][0]['message']['content']
        
        return jsonify({
            'success': True,
            'message': assistant_message,
            'tokens_used': result.get('usage', {}).get('total_tokens', 0)
        })
    else:
        return jsonify({
            'success': False,
            'error': 'LLM API error'
        }), 500

if __name__ == '__main__':
    app.run(port=5000)
```

### Step 2: Update Frontend JavaScript

Modify `js/faq-new.js` to call your backend API:

```javascript
// Find sendFAQMessage function and update:

async function sendFAQMessage(faqId) {
    const input = document.getElementById(`faq-chat-input-${faqId}`);
    const messagesContainer = document.getElementById(`faq-chat-messages-${faqId}`);
    const userMessage = input.value.trim();
    
    if (!userMessage) return;
    
    // Clear input
    input.value = '';
    
    // Get FAQ context
    const faq = FAQ_DATABASE.find(f => f.id === faqId);
    
    // Add user message
    const userMsg = {
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
    };
    
    addMessageToChat(faqId, userMsg);
    
    // Show loading indicator
    showLoadingMessage(faqId);
    
    try {
        // Get conversation history
        const history = getFAQChatHistory(faqId);
        
        // Call your backend API
        const response = await fetch('/api/faq-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                faqId: faqId,
                faqContext: {
                    question: faq.question,
                    answer: faq.answer,
                    category: faq.category
                },
                messages: history.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            })
        });
        
        const data = await response.json();
        
        // Remove loading indicator
        removeLoadingMessage(faqId);
        
        if (data.success) {
            // Add assistant response
            const assistantMsg = {
                role: 'assistant',
                content: data.message,
                timestamp: Date.now()
            };
            
            addMessageToChat(faqId, assistantMsg);
        } else {
            // Show error message
            showErrorMessage(faqId, 'Sorry, I encountered an error. Please try again.');
        }
        
    } catch (error) {
        console.error('FAQ chat error:', error);
        removeLoadingMessage(faqId);
        showErrorMessage(faqId, 'Connection error. Please check your internet and try again.');
    }
}

// Helper functions
function showLoadingMessage(faqId) {
    const messagesContainer = document.getElementById(`faq-chat-messages-${faqId}`);
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'faq-chat-loading';
    loadingDiv.id = `faq-loading-${faqId}`;
    loadingDiv.innerHTML = `
        <div class="faq-chat-message assistant">
            <div class="faq-chat-message-content">
                <span class="faq-loading-dots">Thinking</span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeLoadingMessage(faqId) {
    const loading = document.getElementById(`faq-loading-${faqId}`);
    if (loading) loading.remove();
}

function showErrorMessage(faqId, errorText) {
    const assistantMsg = {
        role: 'assistant',
        content: errorText,
        timestamp: Date.now()
    };
    addMessageToChat(faqId, assistantMsg);
}
```

### Step 3: Add Loading Animation CSS

Add to `css/faq-new.css`:

```css
/* Loading indicator */
.faq-chat-loading {
    animation: fadeIn 0.3s ease;
}

.faq-loading-dots::after {
    content: '...';
    animation: dots 1.5s infinite;
}

@keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

---

## 💰 Cost Estimation

### Groq (Recommended)

**Pricing:** $0.10 per 1M tokens

**Typical FAQ Chat:**
- System prompt: ~200 tokens
- User question: ~50 tokens
- Assistant response: ~300 tokens
- **Total per message: ~550 tokens**

**Cost per message:** $0.000055 (0.0055 cents)

**Monthly estimates:**
- 1,000 messages: $0.055 (~5 cents)
- 10,000 messages: $0.55 (~55 cents)
- 100,000 messages: $5.50

**Conclusion:** Extremely affordable, even at high volume!

### Comparison with Big Tech

**OpenAI (GPT-3.5):** $0.50 per 1M tokens (5x more expensive)  
**OpenAI (GPT-4):** $30.00 per 1M tokens (300x more expensive!)  
**Anthropic (Claude):** $8.00 per 1M tokens (80x more expensive)

**Groq is clearly the most cost-effective choice!**

---

## 🔒 Security Considerations

### 1. API Key Protection

**❌ NEVER expose API keys in frontend code**

```javascript
// ❌ WRONG - Don't do this!
const GROQ_API_KEY = 'gsk_xxxxx';
```

**✅ Correct approach:**
- Store API key in backend environment variables
- Frontend calls YOUR backend
- Backend calls Groq API

### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/api/faq-chat', methods=['POST'])
@limiter.limit("20 per minute")
def faq_chat():
    # ... implementation ...
```

### 3. Input Validation

Sanitize user input to prevent prompt injection:

```python
def sanitize_input(text):
    # Remove potential injection attempts
    forbidden_patterns = [
        'ignore previous instructions',
        'system prompt',
        'new instructions',
        'forget everything'
    ]
    
    text_lower = text.lower()
    for pattern in forbidden_patterns:
        if pattern in text_lower:
            return "I can only answer questions about workplace democracy."
    
    # Limit length
    return text[:1000]
```

### 4. Content Filtering

Filter responses for inappropriate content:

```python
def filter_response(content):
    # Check for inappropriate content
    # Add your filtering logic
    return content
```

---

## 📊 Monitoring & Analytics

Track usage to optimize costs:

```python
import logging

logging.basicConfig(filename='faq_llm.log', level=logging.INFO)

@app.route('/api/faq-chat', methods=['POST'])
def faq_chat():
    # ... existing code ...
    
    # Log usage
    logging.info(f"FAQ Chat - ID: {faq_id}, Tokens: {tokens_used}, Cost: ${tokens_used * 0.0000001}")
    
    return response
```

---

## 🚀 Deployment Checklist

### Before Going Live:

- [ ] Backend API endpoint deployed
- [ ] Groq API key obtained and secured
- [ ] Environment variables configured
- [ ] Rate limiting implemented
- [ ] Input sanitization added
- [ ] Error handling tested
- [ ] Frontend updated with API call
- [ ] Loading indicators working
- [ ] Chat history persistence tested
- [ ] Cost monitoring set up

### Testing:

- [ ] Test with various question types
- [ ] Test error scenarios (network failure, API timeout)
- [ ] Test rate limiting
- [ ] Verify no API key exposure
- [ ] Check response quality
- [ ] Verify cost per message
- [ ] Test on mobile devices
- [ ] Check localStorage encryption

---

## 📝 FAQ Context System

The backend needs access to FAQ context for better responses. Each FAQ includes:

```javascript
{
    id: 'econ-001',
    category: 'economic',
    question: 'Will my home value decrease under workplace democracy?',
    answer: '... (full answer text) ...',
    knowledgeLevel: 'simple',
    relatedTopics: ['retirement', 'investments', 'economy']
}
```

This context helps the LLM:
1. Stay on-topic
2. Reference specific FAQ content
3. Provide consistent answers
4. Suggest related questions

---

## 🎨 System Prompt Template

```
You are a helpful assistant for the Workforce Democracy Project FAQ system.

Context - User is reading this FAQ:
Question: {question}
Category: {category}
Answer Summary: {answer_excerpt}

Your role:
1. Answer follow-up questions about workplace democracy
2. Reference the FAQ content when relevant
3. Be warm, encouraging, and non-partisan
4. Keep responses concise (2-3 paragraphs max)
5. Use real-world examples when helpful
6. If uncertain, acknowledge it and suggest exploring related FAQs

Important guidelines:
- Non-partisan: Present information objectively
- Educational: Focus on explaining concepts clearly
- Practical: Emphasize actionable next steps
- Supportive: Encourage community involvement
- Honest: Acknowledge challenges and trade-offs

Related topics the user might be interested in: {related_topics}

Tone: Conversational, supportive, educational
```

---

## 🔄 Integration with Existing Systems

### Civic, Jobs, Ethical Chat Systems

The FAQ chat follows the same pattern as existing chat systems:

```javascript
// All use localStorage for history
localStorage.setItem('wdp_faq_chat_econ-001', encrypted_data);
localStorage.setItem('wdp_civic_chat_history', encrypted_data);
localStorage.setItem('wdp_jobs_chat_history', encrypted_data);
localStorage.setItem('wdp_ethical_chat_history', encrypted_data);
```

**Unified backend approach:**
```
/api/chat
  - type: 'faq', 'civic', 'jobs', 'ethical'
  - context: {...}
  - messages: [...]
```

---

## 💡 Future Enhancements

1. **Context Awareness**: Link FAQ chats to civic/jobs/ethical conversations
2. **User Preferences**: Adapt responses based on knowledge level
3. **Follow-up Suggestions**: Proactive question recommendations
4. **Cross-FAQ Insights**: Reference multiple FAQs in responses
5. **Local Resource Integration**: Suggest local cooperatives/organizations

---

## 🌟 Summary

**Option A - LLM Integration:**

✅ **Provider:** Groq (ethical, fast, cost-effective)  
✅ **Cost:** ~$0.000055 per message (~5.5 cents per 1,000 messages)  
✅ **Architecture:** Frontend → Your Backend → Groq API  
✅ **Security:** API keys in backend, rate limiting, input sanitization  
✅ **Pattern:** Follows existing civic/jobs/ethical chat systems  
✅ **Ready:** Frontend infrastructure complete, needs backend deployment  

**When backend is available, implementation will take ~2-4 hours of development time.**

---

**Questions? Need help with backend implementation? Ready to deploy? Let me know!**
