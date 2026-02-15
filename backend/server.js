const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { generateExplanation } = require('./utils/geminiExplain');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

// Note: MongoDB connection is commented out for now to ensure the app runs without it if not configured.
// User can uncomment and add MONGO_URI in .env

// Multer setup for file uploads
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
const upload = multer({ dest: 'uploads/' });

// Routes
app.get('/', (req, res) => {
    res.send('ScamShield Backend Running');
});

// Analyze Text
app.post('/api/analyze-text', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        // Call AI Service for ML prediction
        const response = await axios.post(`${AI_SERVICE_URL}/predict-text`, { text });
        const mlResult = response.data;

        // Generate explanation if scam probability is significant
        let explanation = null;
        if (mlResult.scam_probability > 0.4) {
            explanation = await generateExplanation(text, mlResult.scam_probability);
        }

        // Return combined response
        res.json({
            scam_probability: mlResult.scam_probability,
            prediction: mlResult.prediction,
            risk_level: mlResult.risk_level,
            text_snippet: mlResult.text_snippet,
            explanation: explanation
        });
    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(500).json({ error: "Failed to analyze text" });
    }
});

// Analyze Image (Screenshot)
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Image file is required" });

        const filePath = req.file.path;
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        // Call AI Service for OCR + ML prediction
        const response = await axios.post(`${AI_SERVICE_URL}/check-screenshot`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const mlResult = response.data;

        // Cleanup uploaded file
        fs.unlinkSync(filePath);

        // Generate explanation if scam probability is significant
        let explanation = null;
        if (mlResult.scam_probability > 0.4 && mlResult.extracted_text) {
            explanation = await generateExplanation(mlResult.extracted_text, mlResult.scam_probability);
        }

        // Return combined response
        res.json({
            scam_probability: mlResult.scam_probability,
            prediction: mlResult.prediction,
            risk_level: mlResult.risk_level,
            extracted_text: mlResult.extracted_text,
            explanation: explanation
        });
    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(500).json({ error: "Failed to analyze image" });
        // Cleanup on error too
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
