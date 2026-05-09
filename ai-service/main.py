from dotenv import load_dotenv
load_dotenv()  # Load .env before any module that reads env vars

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import easyocr
import joblib
import os
import re
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image
import io
from verification_engine import compute_verification
from website_verification import website_verification_score

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
    
    # ── ML Detection ──────────────────────────────────────────────────────
    text_vectorized = vectorizer.transform([text])
    probability = model.predict_proba(text_vectorized)[0][1]  # Probability of class 1 (Scam)
    
    ml_score = round(float(probability) * 100, 1)
    # rule_score mirrors ml_score for backward compatibility
    rule_score = ml_score

    # ── Verification Engine ───────────────────────────────────────────────
    verification = compute_verification(text)
    verification_score = verification["verification_score"]
    flags = verification["flags"]

    # ── Website & Company Verification ────────────────────────────────────
    web_verif = website_verification_score(text)
    flags.extend(web_verif["flags"])
    flags = list(dict.fromkeys(flags))  # Deduplicate flags

    # ── Final Score (before Gemini — Gemini applied in backend) ───────────
    # Preliminary: 0.6 * ml_score + 0.4 * verification_score
    # The backend will re-compute with Gemini weight included
    preliminary_final = round(0.6 * ml_score + 0.4 * verification_score, 1)

    # ── Risk Classification ───────────────────────────────────────────────
    risk = "High" if preliminary_final > 70 else ("Medium" if preliminary_final > 40 else "Low")

    # ── Legacy fields ─────────────────────────────────────────────────────
    prediction = "Scam" if probability > 0.5 else "Safe"
    risk_level = "High" if probability > 0.8 else ("Medium" if probability > 0.4 else "Low")
    
    return {
        # New pipeline fields
        "ml_score": ml_score,
        "rule_score": rule_score,
        "verification_score": verification_score,
        "email_score": verification["email_score"],
        "url_score": verification["url_score"],
        "contact_score": verification["contact_score"],
        "consistency_score": verification["consistency_score"],
        "final_score": preliminary_final,
        "risk": risk,
        "flags": flags,
        "website_verification": web_verif,
        # Legacy fields (backward compat)
        "scam_probability": float(probability),
        "prediction": prediction,
        "risk_level": risk_level,
    }

@app.post("/predict-text")
def predict_text(request: TextRequest):
    result = analyze_text(request.text)
    return {
        "text_snippet": request.text[:100] + "...",
        **result
    }

def _clean_ocr_text(fragments: list) -> str:
    """
    Post-process EasyOCR fragments to produce clean text that the
    verification engine can reliably pattern-match against.
    This bridges the gap between OCR output and typed text.
    """
    # Join fragments with a single space
    text = " ".join(f.strip() for f in fragments if f.strip())

    # Fix OCR-mangled email: spaces around '@'
    text = re.sub(r'([a-zA-Z0-9._%+-])\s+@\s*([a-zA-Z0-9.-])', r'\1@\2', text)
    text = re.sub(r'([a-zA-Z0-9._%+-])@\s+([a-zA-Z0-9.-])', r'\1@\2', text)
    text = re.sub(r'([a-zA-Z0-9._%+-])\s+@([a-zA-Z0-9.-])', r'\1@\2', text)
    # '©' / '(at)' / '[at]' → '@'
    text = re.sub(r'\s*©\s*', '@', text)
    text = re.sub(r'\s*\(at\)\s*', '@', text)
    text = re.sub(r'\s*\[at\]\s*', '@', text)

    # Fix OCR-mangled URLs: spaces inside 'http://' or 'https://'
    text = re.sub(r'https?\s*:\s*/\s*/', lambda m: m.group(0).replace(' ', ''), text)
    text = re.sub(r'http\s*:\s*/\s*/', 'http://', text)
    text = re.sub(r'https\s*:\s*/\s*/', 'https://', text)

    # Fix phone: '+91 XXXXXXXXXX' — OCR sometimes splits the country code
    text = re.sub(r'(\+91)\s+(\d)', r'\1\2', text)
    # '0' followed by 10-digit run split by space e.g. '098765 43210'
    text = re.sub(r'(\b0\d{5})\s+(\d{5}\b)', r'\1\2', text)

    # Remove stray line-break artefacts (multiple spaces → single space)
    text = re.sub(r' {2,}', ' ', text).strip()

    return text


@app.post("/check-screenshot")
async def check_screenshot(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # EasyOCR extraction — detail=0 returns list of text strings per detected region
        extracted_text_list = reader.readtext(np.array(image), detail=0)

        # ── DEBUG: Print what OCR actually read ──────────────────────────
        print("\n" + "="*60)
        print("OCR RAW FRAGMENTS:")
        for i, fragment in enumerate(extracted_text_list):
            print(f"  [{i}] {repr(fragment)}")
        # ────────────────────────────────────────────────────────────────

        # Normalize OCR artefacts so the verification engine gets clean text
        extracted_text = _clean_ocr_text(extracted_text_list)

        print("OCR CLEANED TEXT:")
        print(f"  {repr(extracted_text)}")
        print("="*60 + "\n")
        
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
