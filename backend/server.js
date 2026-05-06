const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { generateExplanation, generateVerification } = require('./utils/geminiExplain');
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

/**
 * Compute the final weighted score combining ML, verification, and Gemini scores.
 * Formula: final_score = 0.5 * ml_score + 0.3 * verification_score + 0.2 * gemini_score
 */
function computeFinalScore(mlScore, verificationScore, geminiScore) {
    return Math.round((0.5 * mlScore + 0.3 * verificationScore + 0.2 * geminiScore) * 10) / 10;
}

/**
 * Determine risk level from final score
 */
function getRisk(finalScore) {
    if (finalScore > 70) return "High";
    if (finalScore > 40) return "Medium";
    return "Low";
}

// Routes
app.get('/', (req, res) => {
    res.send('ScamShield Backend Running');
});

// ── Analyze Text ──────────────────────────────────────────────────────────────
app.post('/api/analyze-text', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        // Call AI Service for ML prediction + rule-based verification
        const response = await axios.post(`${AI_SERVICE_URL}/predict-text`, { text });
        const mlResult = response.data;

        // Run Gemini explanation and verification in parallel
        const [explanation, geminiVerification] = await Promise.all([
            mlResult.scam_probability > 0.4
                ? generateExplanation(text, mlResult.scam_probability)
                : Promise.resolve(null),
            generateVerification(text)
        ]);

        // Compute final score with Gemini weight
        const geminiScore = geminiVerification.verification_score || 0;
        const finalScore = computeFinalScore(
            mlResult.ml_score,
            mlResult.verification_score,
            geminiScore
        );
        const risk = getRisk(finalScore);

        // Merge Gemini issues into flags (deduplicate)
        const allFlags = [...(mlResult.flags || [])];
        if (geminiVerification.issues && geminiVerification.issues.length > 0) {
            for (const issue of geminiVerification.issues) {
                if (!allFlags.includes(issue)) allFlags.push(issue);
            }
        }

        res.json({
            // Pipeline scores
            ml_score: mlResult.ml_score,
            verification_score: mlResult.verification_score,
            gemini_score: geminiScore,
            final_score: finalScore,
            risk: risk,
            flags: allFlags,
            // Sub-scores for breakdown
            email_score: mlResult.email_score,
            url_score: mlResult.url_score,
            contact_score: mlResult.contact_score,
            consistency_score: mlResult.consistency_score,
            // Legacy fields
            scam_probability: mlResult.scam_probability,
            prediction: mlResult.prediction,
            risk_level: mlResult.risk_level,
            text_snippet: mlResult.text_snippet,
            // Gemini explanation
            explanation: explanation,
            gemini_issues: geminiVerification.issues || [],
            website_verification: mlResult.website_verification || null,
        });
    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(500).json({ error: "Failed to analyze text" });
    }
});

// ── Analyze Image (Screenshot) ────────────────────────────────────────────────
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) return res.status(400).json({ error: "Image file is required" });

        filePath = req.file.path;
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        // Call AI Service for OCR + ML prediction + rule-based verification
        // Longer timeout because EasyOCR takes time to process the image
        const response = await axios.post(`${AI_SERVICE_URL}/check-screenshot`, form, {
            headers: { ...form.getHeaders() },
            timeout: 120000, // 2 minutes for OCR
        });

        const mlResult = response.data;

        // Cleanup uploaded file
        fs.unlinkSync(filePath);
        filePath = null;

        // Use extracted text for Gemini; fall back to empty string if OCR failed
        const analysisText = (mlResult.extracted_text || '').trim();

        // Run Gemini explanation and verification in parallel — same as text route
        // Gemini verification always runs (returns score 0 gracefully if text is empty)
        const [explanation, geminiVerification] = await Promise.all([
            (analysisText && mlResult.scam_probability > 0.4)
                ? generateExplanation(analysisText, mlResult.scam_probability)
                : Promise.resolve(null),
            analysisText
                ? generateVerification(analysisText)
                : Promise.resolve({ verification_score: 0, issues: ["No text could be extracted from image"] })
        ]);

        // Compute final score with Gemini weight
        const geminiScore = geminiVerification.verification_score || 0;
        const finalScore = computeFinalScore(
            mlResult.ml_score || 0,
            mlResult.verification_score || 0,
            geminiScore
        );
        const risk = getRisk(finalScore);

        // Merge Gemini issues into flags (deduplicate)
        const allFlags = [...(mlResult.flags || [])];
        if (geminiVerification.issues && geminiVerification.issues.length > 0) {
            for (const issue of geminiVerification.issues) {
                if (!allFlags.includes(issue)) allFlags.push(issue);
            }
        }

        res.json({
            // Pipeline scores
            ml_score: mlResult.ml_score || 0,
            verification_score: mlResult.verification_score || 0,
            gemini_score: geminiScore,
            final_score: finalScore,
            risk: risk,
            flags: allFlags,
            // Sub-scores for breakdown
            email_score: mlResult.email_score || 0,
            url_score: mlResult.url_score || 0,
            contact_score: mlResult.contact_score || 0,
            consistency_score: mlResult.consistency_score || 0,
            // Legacy fields
            scam_probability: mlResult.scam_probability,
            prediction: mlResult.prediction,
            risk_level: mlResult.risk_level,
            extracted_text: mlResult.extracted_text,
            // Gemini explanation
            explanation: explanation,
            gemini_issues: geminiVerification.issues || [],
            website_verification: mlResult.website_verification || null,
        });
    } catch (error) {
        console.error("AI Service Error:", error.message);
        // Cleanup on error too
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ error: "Failed to analyze image" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
