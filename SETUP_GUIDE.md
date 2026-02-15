# 🚀 ScamShield - Setup & Run Guide

## Prerequisites

Before running the project, ensure you have the following installed:

- **Docker Desktop** (recommended) - [Download here](https://www.docker.com/products/docker-desktop/)
- **Node.js** (v18+) - [Download here](https://nodejs.org/)
- **Python** (v3.9+) - [Download here](https://www.python.org/)
- **Git** (optional)

---

## 🐳 Method 1: Run with Docker (Recommended)

This is the **easiest way** to run the entire project with one command.

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### Step 2: Build and Run All Services
Open a terminal in the project root directory and run:

```bash
docker-compose up --build
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **MongoDB**: localhost:27017

### Step 4: Stop the Application
Press `Ctrl+C` in the terminal, then run:

```bash
docker-compose down
```

---

## 💻 Method 2: Run Locally (Without Docker)

If you prefer to run services individually:

### 1️⃣ Setup Backend (Express.js)

```bash
cd backend
npm install
npm start
```

The backend will run on **http://localhost:5000**

### 2️⃣ Setup AI Service (Python/FastAPI)

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On Mac/Linux

pip install -r requirements.txt
python main.py
```

The AI service will run on **http://localhost:8000**

### 3️⃣ Setup Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:5173** (Vite default port)

### 4️⃣ Setup MongoDB (Optional)

If you want to use MongoDB:

```bash
# Install MongoDB locally or use MongoDB Atlas (cloud)
# Update backend/.env with your MONGO_URI
# Uncomment MongoDB connection code in backend/server.js
```

---

## 🧪 Testing the Application

### Test Text Analysis
1. Go to http://localhost:3000
2. Click **"Start Analysis"** or navigate to `/text`
3. Paste a job description (e.g., "Earn $5000/week from home! No experience needed!")
4. Click **"Analyze Text"**
5. View the scam probability and risk level

### Test Image Analysis
1. Navigate to `/image`
2. Upload a screenshot of a job posting
3. Click **"Analyze Screenshot"**
4. The AI will extract text via OCR and analyze it

---

## 🔧 Configuration

### Backend Environment Variables
Create a `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/scamshield
AI_SERVICE_URL=http://localhost:8000
```

### Frontend Configuration
If running locally (not Docker), update API URLs in frontend code if needed.

---

## 🐛 Troubleshooting

### Issue: Docker containers won't start
- **Solution**: Make sure Docker Desktop is running
- Check if ports 3000, 5000, 8000, 27017 are not already in use

### Issue: AI Service fails to start
- **Solution**: Install Python dependencies: `pip install -r requirements.txt`
- Make sure you have Python 3.9+ installed

### Issue: Frontend can't connect to backend
- **Solution**: Check that backend is running on port 5000
- Verify CORS is enabled in `backend/server.js`

### Issue: OCR not working
- **Solution**: EasyOCR downloads models on first run (may take time)
- Ensure you have a stable internet connection

---

## 📦 Project Ports Summary

| Service      | Port  | URL                      |
|-------------|-------|--------------------------|
| Frontend    | 3000  | http://localhost:3000    |
| Backend     | 5000  | http://localhost:5000    |
| AI Service  | 8000  | http://localhost:8000    |
| MongoDB     | 27017 | mongodb://localhost:27017|

---

## 🎯 Quick Start Commands

### Docker (All-in-One)
```bash
docker-compose up --build
```

### Local Development
```bash
# Terminal 1 - Backend
cd backend && npm install && npm start

# Terminal 2 - AI Service
cd ai-service && pip install -r requirements.txt && python main.py

# Terminal 3 - Frontend
cd frontend && npm install && npm run dev
```

---

## 🚀 Next Steps

1. ✅ Run the application using Docker or locally
2. ✅ Test text and image analysis features
3. ✅ Customize the ML model by training with your own data
4. ✅ Deploy to production (Vercel, Railway, AWS, etc.)

---

## 📝 Notes

- MongoDB is **optional** - the app works without it
- The ML model is a **demo model** - retrain with real scam data for better accuracy
- EasyOCR may take time to download models on first run (~100MB)

---

**Happy Scam Hunting! 🛡️**
