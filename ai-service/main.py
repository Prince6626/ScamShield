from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import easyocr
import joblib
import os
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Load Model & Vectorizer
MODEL_PATH = "scam_model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

model = None
vectorizer = None

def load_models():
    global model, vectorizer
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        print("Model files not found. Training dummy model...")
        import train_model
        # train_model.py script should save the models, now we load them
    
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("Models loaded successfully.")
    else:
        print("Failed to load models.")

load_models()

# Initialize EasyOCR Reader (loads into memory)
reader = easyocr.Reader(['en'])

class TextRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "ScamShield AI Service Running (EasyOCR Enabled)"}

def analyze_text(text: str):
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Vectorize text
    text_vectorized = vectorizer.transform([text])
    
    # Predict
    probability = model.predict_proba(text_vectorized)[0][1] # Probability of class 1 (Scam)
    
    prediction = "Scam" if probability > 0.5 else "Safe"
    risk_level = "High" if probability > 0.8 else ("Medium" if probability > 0.4 else "Low")
    
    return {
        "scam_probability": float(probability),
        "prediction": prediction,
        "risk_level": risk_level
    }

@app.post("/predict-text")
def predict_text(request: TextRequest):
    result = analyze_text(request.text)
    return {
        "text_snippet": request.text[:100] + "...",
        **result
    }

@app.post("/check-screenshot")
async def check_screenshot(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # EasyOCR extraction
        # detail=0 returns just the list of text
        extracted_text_list = reader.readtext(np.array(image), detail=0)
        extracted_text = " ".join(extracted_text_list)
        
        if not extracted_text.strip():
            return {"error": "No text detected in image"}
            
        result = analyze_text(extracted_text)
        
        return {
            "extracted_text": extracted_text,
            **result
        }
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Ensure models exist before running behavior
    if not os.path.exists(MODEL_PATH):
        import train_model
        print("Training dummy model...")
        
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
