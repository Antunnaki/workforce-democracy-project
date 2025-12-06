# BACKEND UPDATE INSTRUCTIONS

## Manual Steps to Update the Backend

Since the automated script requires SSH authentication, here are the manual steps to update the backend:

### 1. SSH into the Server
```bash
ssh root@185.193.126.13
```

When prompted, enter the password: `YNWA1892LFC`

### 2. Navigate to the Backend Directory
```bash
cd /var/www/workforce-democracy/backend
```

### 3. Pull the Latest Changes
```bash
git pull origin main
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Update Environment Variables
Edit the `.env` file to ensure the Qwen API key is set:
```bash
nano .env
```

Make sure these lines are present with your actual values:
```bash
# Qwen API Configuration (Primary AI Service)
QWEN_API_KEY=your_actual_qwen_api_key_from_dashscope
QWEN_MODEL=qwen-plus
```

To exit nano:
- Press `Ctrl + X`
- Press `Y` to save
- Press `Enter` to confirm

### 6. Restart Services
```bash
pm2 restart workforce-democracy-a
pm2 restart workforce-democracy-b
```

### 7. Check Service Status
```bash
pm2 list
```

### 8. Check Logs (if needed)
```bash
pm2 logs workforce-democracy-a
```

Press `Ctrl + C` to exit the logs.

### 9. Exit SSH Session
```bash
exit
```

## Verification

After updating the backend, run the test script again:
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/Workforce Democracy Project"
./TEST_CHAT_FIX.sh
```

The AI service health endpoint should now show:
```json
{
  "success": true,
  "available": true,
  "model": "qwen-plus",
  "provider": "Tongyi Lab",
  "message": "LLM service is available"
}
```

And the direct chat endpoint should return actual AI responses instead of fallback messages.