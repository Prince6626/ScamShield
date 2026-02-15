# Quick Test Guide

## Test the Gemini Integration

### 1. Test via Browser

1. Open http://localhost:3000
2. Click "Start Analysis"
3. Paste this scam text:
```
Earn $5000/week from home! 
Just pay $99 registration fee. 
Contact via WhatsApp: +1234567890
```
4. Click "Analyze Text"
5. You should see:
   - High scam probability (>80%)
   - **Detailed Explanation section** with:
     - Why This Was Flagged (blue card)
     - Scam Signals Detected (red card)
     - Safety Tips for Students (green card)
     - Verification Steps (purple card)

### 2. Test via API

```powershell
# Test endpoint directly
$body = @{
    text = "Earn $5000/week from home! Just pay $99 registration fee. Contact via WhatsApp."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analyze-text" -Method POST -ContentType "application/json" -Body $body
```

### Expected Response Structure

```json
{
  "scam_probability": 0.87,
  "prediction": "Scam",
  "risk_level": "High",
  "text_snippet": "...",
  "explanation": {
    "reason": "...",
    "signals": ["...", "..."],
    "tips": ["...", "..."],
    "verification": ["...", "..."]
  }
}
```

### Troubleshooting

If you don't see the explanation:

1. **Check backend is restarted**: Backend must be restarted after code changes
2. **Check API key**: Verify `GEMINI_API_KEY` is set in `backend/.env`
3. **Check scam probability**: Explanation only shows if probability > 0.4
4. **Check console**: Look for errors in browser console (F12)
5. **Check backend logs**: Look for "Gemini API Error" messages
