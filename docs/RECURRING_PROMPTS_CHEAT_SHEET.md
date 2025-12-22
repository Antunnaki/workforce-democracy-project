# Civic Platform AI Prompt & Server Cheat Sheet

Welcome to your first site! This document is designed to help you manage your server and interact with Junie or Lingma effectively without needing to remember complex technical details.

## 🚀 Server Management (The "Panic" Commands)

If the site isn't responding or you've just updated an API key, use these commands in your terminal:

| Action | Command | When to use |
|--------|---------|-------------|
| **Restart Server** | `pm2 restart backend` | After updating `.env` or if the API is "stuck". |
| **Check Status** | `pm2 status` | To see if the server is running (`online`). |
| **View Logs** | `pm2 logs backend` | If you see errors on the site and need to know why. |
| **Stop Server** | `pm2 stop backend` | If you need to shut it down temporarily. |

---

## 🤖 Recurring Prompts for Junie/Lingma

Save these prompts to quickly get the AI started on common tasks:

### 1. The "Health Check" Prompt
> "Please check if the backend server is running and if the AI chat can connect to the current API keys. If it's failing, let me know the specific error."

### 2. The "Deployment" Prompt
> "I have made changes to the frontend. Can you please help me deploy these changes to the production server (Netlify/VPS) and verify the live site?"

### 3. The "Troubleshooting" Prompt
> "The AI chat is returning fallback messages (standard 'I'm sorry' replies). Please check the `backend/.env` file and the AI service logs to see if the API key is working or if we've hit a quota limit."

### 4. The "Update Keys" Prompt
> "I have new API keys for [Service Name]. Please update the `.env` file with these new keys and restart the server to apply the changes."

---

## 📂 Key Files to Know

As a novice, these are the only files you might ever need to "peek" into:

1.  **`backend/.env`**: This is your "Safe". It holds all your secrets (API keys and passwords). **Never share this file publicly.**
2.  **`AI_HANDOVER_COMPLETE.md`**: This is your "Map". It tells any AI exactly how the system is built.
3.  **`CHANGELOG.md`**: This is your "History". It tracks what changes were made and when.

---

## 💡 Pro Tips for a Beginner
- **Consistency is Key**: When asking an AI for help, always mention if you are working on the "Production" site or the "Beta" site.
- **Copy-Paste Errors**: If you copy a command, make sure there are no extra spaces at the beginning or end.
- **Take Backups**: Before asking for a major feature change, ask: "Can you create a backup of the current working files before we start?"
