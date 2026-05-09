import re
import requests
from urllib.parse import urlparse
import json
import os

try:
    from google import genai as _genai_module
    GEMINI_AVAILABLE = True
    _api_key = os.environ.get("GEMINI_API_KEY", "")
    _gemini_client = _genai_module.Client(api_key=_api_key) if _api_key else None
except (ImportError, Exception):
    GEMINI_AVAILABLE = False
    _gemini_client = None

def extract_company(text):
    # Regex fallback for extracting company
    # Try multiple common patterns
    patterns = [
        r'(?i)company\s*:\s*([a-zA-Z0-9&\s.-]{2,40})(?:\r|\n|,|\.|!|\||$)',
        r'(?i)employer\s*:\s*([a-zA-Z0-9&\s.-]{2,40})(?:\r|\n|,|\.|!|\||$)',
        r'(?i)organization\s*:\s*([a-zA-Z0-9&\s.-]{2,40})(?:\r|\n|,|\.|!|\||$)',
        r'(?i)(?:role|position|job|internship)\s+(?:at|for|with)\s+([a-zA-Z0-9&\s.-]{1,30}?)(?:\r|\n|,|\.|!|\||\s(?:as|at|is|for|in)\s|$)',
        r'(?i)joining\s+([a-zA-Z0-9&\s.-]{1,30}?)(?:\r|\n|,|\.|!|\||\s(?:as|at|is|for|in)\s|$)',
        r'(?i)work(?:ing)?\s+(?:at|for)\s+([a-zA-Z0-9&\s.-]{1,30}?)(?:\r|\n|,|\.|!|\||\s(?:as|at|is|for|in)\s|$)',
        r'(?i)hiring\s+(?:at|for|with)\s+([a-zA-Z0-9&\s.-]{1,30}?)(?:\r|\n|,|\.|!|\||\s(?:as|at|is|for|in)\s|$)',
        r'(?i)([a-zA-Z0-9&\s.-]{2,40})\s+(?:Pvt\s*Ltd|Ltd|Inc\.|Corp\.|LLC|Group)',
        r'(?i)([a-zA-Z0-9&\s.-]{2,30}?)\s+(?:is\s+hiring|is\s+looking\s+for|announced\s+hiring)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
            
    # Try Gemini extraction if regex fails
    if GEMINI_AVAILABLE and _gemini_client and os.environ.get("GEMINI_API_KEY"):
        prompt = "Extract the company name from this job post. Return only the company name, or 'None' if no company is detected.\n\nText:\n" + text[:1500]
        try:
            response = _gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            company_name = response.text.strip()
            if company_name and company_name.lower() != 'none':
                return company_name
        except Exception as e:
            print(f"Gemini Extraction Error: {e}")
            
    return None

def extract_url(text):
    # Simple regex for URLs
    url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
    match = url_pattern.search(text)
    if match:
        url = match.group(0)
        if url.startswith('www.'):
            url = 'http://' + url
        return url
    return None

def check_website(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def domain_risk(url):
    score = 0
    flags = []
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        suspicious_tlds = ['.xyz', '.top', '.click', '.online', '.club', '.info', '.biz']
        for tld in suspicious_tlds:
            if domain.endswith(tld):
                score += 30
                flags.append(f"Suspicious TLD ({tld})")
                break
                
        if parsed.scheme == 'http':
            score += 10
            flags.append("No HTTPS")
            
        return {"score": score, "flags": flags}
    except Exception:
        return {"score": 0, "flags": []}

def company_domain_match(company, url):
    if not company or not url:
        return {"score": 0, "flags": []}
        
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Strip common suffixes and spaces from company name for simpler matching
        company_simple = re.sub(r'(?i)(inc\.|llc|corp\.|ltd\.|company)', '', company).strip().lower()
        company_simple = re.sub(r'[^a-z0-9]', '', company_simple)
        
        if len(company_simple) >= 3 and company_simple not in domain:
            # Common job boards won't match the company name, but those shouldn't be penalized as much
            # For this MVP, we add the mismatch penalty
            return {"score": 30, "flags": ["Domain mismatch"]}
            
    except Exception:
        pass
        
    return {"score": 0, "flags": []}

def gemini_verification(text):
    if not GEMINI_AVAILABLE or not _gemini_client or not os.environ.get("GEMINI_API_KEY"):
        return {"verification_score": 0, "issues": []}
        
    prompt = """Analyze this job post and verify the company authenticity.
Check:
- Is the company likely real?
- Does the website look official?
- Is there mismatch between company name and domain?
- Does the contact method look suspicious?

Return ONLY JSON:
{
  "verification_score": number (0-100 risk score, 100 is most suspicious),
  "issues": ["...", "..."]
}

Job post:
""" + text[:2000]

    try:
        response = _gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        text_resp = response.text
        
        # Robust JSON extraction
        json_match = re.search(r'\{.*\}', text_resp, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            return {
                "verification_score": data.get("verification_score", 0),
                "issues": data.get("issues", [])
            }
    except Exception as e:
        print(f"Gemini Verification Error: {e}")
        
    return {"verification_score": 0, "issues": []}

def website_verification_score(text):
    company = extract_company(text)
    url = extract_url(text)
    
    website_exists = False
    domain_score = 0
    company_match_score = 0
    website_exists_score = 0
    flags = []
    
    if url:
        website_exists = check_website(url)
        if not website_exists:
            website_exists_score = 50
            flags.append("Website not reachable")
            
        d_risk = domain_risk(url)
        domain_score = d_risk["score"]
        flags.extend(d_risk["flags"])
        
        if company:
            c_match = company_domain_match(company, url)
            company_match_score = c_match["score"]
            flags.extend(c_match["flags"])
    
    gemini_res = gemini_verification(text)
    gemini_score = gemini_res["verification_score"]
    flags.extend(gemini_res["issues"])
    
    final_score = (domain_score * 0.3) + (company_match_score * 0.3) + (website_exists_score * 0.2) + (gemini_score * 0.2)
    
    # Deduplicate flags
    flags = list(dict.fromkeys(flags))
    
    return {
        "final_score": min(100.0, round(final_score, 1)),
        "company": company,
        "url": url,
        "website_live": website_exists,
        "flags": flags
    }
