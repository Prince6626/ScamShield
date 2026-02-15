const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lazy initialize Gemini AI to avoid errors if API key not set
let genAI = null;
function getGenAI() {
    if (!genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here') {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}


/**
 * Extract JSON from Gemini response (handles extra text)
 * @param {string} response - Raw response from Gemini
 * @returns {object|null} - Parsed JSON object or null
 */
function extractJSON(response) {
    try {
        // Try direct parse first
        return JSON.parse(response);
    } catch (e) {
        // Extract JSON from markdown code blocks or mixed text
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                         response.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            try {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            } catch (parseError) {
                console.error('Failed to parse extracted JSON:', parseError);
                return null;
            }
        }
        
        console.error('No valid JSON found in response');
        return null;
    }
}

/**
 * Generate explanation for scam detection using Gemini
 * @param {string} jobText - The job posting text
 * @param {number} scamProbability - Scam probability (0-1)
 * @returns {Promise<object>} - Explanation object with reason, signals, tips, verification
 */
async function generateExplanation(jobText, scamProbability) {
    try {
        const ai = getGenAI();
        if (!ai) {
            console.warn('Gemini API key not configured');
            return {
                reason: "API key not configured",
                signals: ["Unable to generate detailed explanation"],
                tips: ["Configure GEMINI_API_KEY in backend/.env"],
                verification: ["Get your API key from Google AI Studio"]
            };
        }

        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const riskLevel = scamProbability > 0.8 ? "HIGH" : (scamProbability > 0.4 ? "MEDIUM" : "LOW");
        
        const prompt = `You are an expert at detecting job scams targeting students and young professionals.

Analyze this job posting and provide a detailed explanation in JSON format.

Job Text:
"""
${jobText}
"""

Scam Probability: ${(scamProbability * 100).toFixed(1)}%
Risk Level: ${riskLevel}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "reason": "A clear 1-2 sentence explanation of why this was flagged as a scam or marked safe",
  "signals": ["List 3-5 specific red flags or positive indicators found in the text"],
  "tips": ["List 3-4 actionable safety tips for students to protect themselves"],
  "verification": ["List 3-4 specific verification steps like checking LinkedIn, company website, email domain, etc."]
}

Important:
- Be specific and reference actual text from the job posting
- For low-risk jobs, focus on positive signals and general safety practices
- For high-risk jobs, highlight urgent red flags
- Keep each point concise (1 sentence max)
- Return ONLY the JSON object, nothing else`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        // Extract and parse JSON
        const explanation = extractJSON(response);
        
        if (!explanation) {
            throw new Error('Failed to parse Gemini response');
        }

        // Validate structure
        if (!explanation.reason || !explanation.signals || !explanation.tips || !explanation.verification) {
            throw new Error('Invalid explanation structure from Gemini');
        }

        return explanation;

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        
        // Fallback explanation
        return {
            reason: scamProbability > 0.5 
                ? "This job posting shows characteristics commonly found in scam listings."
                : "This job posting appears relatively safe, but always verify before proceeding.",
            signals: scamProbability > 0.5
                ? [
                    "Unusual payment requests or registration fees",
                    "Vague job description or unrealistic promises",
                    "Non-professional contact methods (WhatsApp, Telegram)"
                ]
                : [
                    "Professional language and clear job description",
                    "Reasonable compensation expectations",
                    "Standard application process"
                ],
            tips: [
                "Never pay upfront fees for job applications",
                "Research the company thoroughly before applying",
                "Verify contact information and company details",
                "Trust your instincts - if it seems too good to be true, it probably is"
            ],
            verification: [
                "Check company website and LinkedIn profile",
                "Verify email domain matches official company domain",
                "Search for company reviews on Glassdoor or Indeed",
                "Contact company directly through official channels"
            ]
        };
    }
}

module.exports = {
    generateExplanation,
    extractJSON
};
