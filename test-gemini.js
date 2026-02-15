const axios = require('axios');

async function testGeminiIntegration() {
    try {
        console.log('Testing Gemini Integration...\n');
        
        const testText = "Earn $5000/week from home! Just pay $99 registration fee. Contact via WhatsApp: +1234567890";
        
        console.log('Sending request to backend...');
        const response = await axios.post('http://localhost:5000/api/analyze-text', {
            text: testText
        });
        
        console.log('\n✅ Response received!\n');
        console.log('Scam Probability:', (response.data.scam_probability * 100).toFixed(1) + '%');
        console.log('Prediction:', response.data.prediction);
        console.log('Risk Level:', response.data.risk_level);
        
        if (response.data.explanation) {
            console.log('\n🎉 GEMINI EXPLANATION FOUND!\n');
            console.log('Reason:', response.data.explanation.reason);
            console.log('\nScam Signals:');
            response.data.explanation.signals.forEach((signal, idx) => {
                console.log(`  ${idx + 1}. ${signal}`);
            });
            console.log('\nSafety Tips:');
            response.data.explanation.tips.forEach((tip, idx) => {
                console.log(`  ${idx + 1}. ${tip}`);
            });
            console.log('\nVerification Steps:');
            response.data.explanation.verification.forEach((step, idx) => {
                console.log(`  ${idx + 1}. ${step}`);
            });
        } else {
            console.log('\n❌ NO EXPLANATION FOUND');
            console.log('This might mean:');
            console.log('  - Scam probability is below 0.4 threshold');
            console.log('  - Gemini API key is not configured');
            console.log('  - Backend is running old code');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testGeminiIntegration();
