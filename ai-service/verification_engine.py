"""
ScamShield Verification Engine
Rule-based + evidence-based validation for job posting scam detection.
Returns verification_score (0-100) and human-readable flags.
"""

import re
from typing import Dict, List, Tuple

# ─── Constants ────────────────────────────────────────────────────────────────

FREE_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "aol.com", "mail.com", "protonmail.com", "yandex.com",
    "zoho.com", "icloud.com", "gmx.com", "live.com",
    "rediffmail.com", "yahoo.in",
}

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".click", ".buzz", ".gq", ".ml", ".tk",
    ".cf", ".ga", ".work", ".loan", ".racing", ".win",
    ".bid", ".stream", ".download", ".club", ".site", ".icu",
    ".online", ".info", ".biz",
}

URGENT_KEYWORDS = [
    "urgent", "hurry", "limited seats", "act now", "apply now",
    "immediate joining", "last chance", "today only", "don't miss",
    "guaranteed salary", "earn daily", "work from home",
    "earn ₹", "earn rs", "earn usd", "earn $",
    "no experience needed", "no qualification", "part time",
    "passive income",
]

BIG_COMPANY_NAMES = [
    "amazon", "google", "microsoft", "apple", "meta", "facebook",
    "flipkart", "infosys", "wipro", "tcs", "reliance", "hdfc",
    "sbi", "icici", "zomato", "swiggy", "ola", "uber",
]

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _normalize_ocr(text: str) -> str:
    """
    Normalize common OCR misreads before pattern matching.
    Only fixes actually broken patterns — does NOT touch already valid URLs.
    """
    # Fix OCR-mangled URLs with spaces: 'http ://' or 'http :// ' → 'http://'
    # Only match when there IS a space (broken), not the already-valid 'http://'
    text = re.sub(r'https?\s+://\s*', lambda m: m.group(0).split()[0].rstrip(':') + '://', text)
    text = re.sub(r'http\s*:\s*/\s*/', 'http://', text)
    text = re.sub(r'https\s*:\s*/\s*/', 'https://', text)
    # Fix OCR-mangled emails: '©' or '(at)' or '[at]' → '@'
    text = re.sub(r'\s*©\s*', '@', text)
    text = re.sub(r'\s*\(at\)\s*', '@', text)
    text = re.sub(r'\s*\[at\]\s*', '@', text)
    # Fix broken phone: OCR may add spaces after +91
    # e.g. '+91 9876543210' → '+919876543210'
    text = re.sub(r'(\+91)\s+(\d)', r'\1\2', text)
    return text


def _extract_emails(text: str) -> List[str]:
    """Extract all email addresses from text (tolerant of OCR artifacts)."""
    text = _normalize_ocr(text)
    # Also fix OCR space-around-@ artifact: 'user @ gmail.com' or 'user@ gmail.com'
    text = re.sub(r'([a-zA-Z0-9._%+-])\s+@\s+([a-zA-Z0-9.-])', r'\1@\2', text)
    text = re.sub(r'([a-zA-Z0-9._%+-])@\s+([a-zA-Z0-9.-])', r'\1@\2', text)
    text = re.sub(r'([a-zA-Z0-9._%+-])\s+@([a-zA-Z0-9.-])', r'\1@\2', text)
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    return re.findall(pattern, text.lower())


def _extract_urls(text: str) -> List[str]:
    """Extract all URLs from text (tolerant of OCR artifacts)."""
    text = _normalize_ocr(text)
    text_lower = text.lower()
    urls = []

    # Standard http/https URLs (simple permissive pattern)
    pattern = r'https?://[^\s]+'
    urls.extend(re.findall(pattern, text_lower))

    # www. URLs without protocol
    www_pattern = r'(?:^|\s)(www\.[^\s]+)'
    urls.extend(re.findall(www_pattern, text_lower))

    # Bare domains with suspicious TLDs — handles typed text WITHOUT http://
    # e.g. 'amazon-careers-job.xyz' or 'jobs.top'
    tld_alts = '|'.join(re.escape(t.lstrip('.')) for t in SUSPICIOUS_TLDS)
    bare_pattern = r'(?:^|\s)([a-z0-9][a-z0-9\-\.]{2,50}\.(?:' + tld_alts + r'))(?:\s|$|[,;!?:/])'
    for m in re.finditer(bare_pattern, text_lower):
        candidate = m.group(1)
        # Avoid double-adding URLs already captured by http(s) pattern
        if not any(candidate in u for u in urls):
            urls.append('http://' + candidate)

    return urls


def _extract_company_names(text: str) -> List[str]:
    """
    Heuristic extraction of potential company names.
    Covers: 'Company: X', 'at X', 'from X', 'AMAZON HIRING', etc.
    """
    names = []

    # Explicit label patterns: "Company: Amazon"
    explicit_patterns = [
        r'(?:company|organization|organisation|firm|employer|recruiter)\s*[:\-]\s*([A-Za-z0-9 &.]{2,40})',
        r'(?:at|from|with|join|joining)\s+([A-Z][a-zA-Z0-9 &.]{2,30})(?:\s*[,.\n!])',
    ]
    for pat in explicit_patterns:
        matches = re.findall(pat, text, re.IGNORECASE)
        names.extend([m.strip() for m in matches if len(m.strip()) > 2])

    # Detect big company impersonation (e.g. "AMAZON HIRING", "Google Jobs")
    for company in BIG_COMPANY_NAMES:
        if re.search(r'\b' + re.escape(company) + r'\b', text, re.IGNORECASE):
            names.append(company.capitalize())

    return list(set(names))


def _get_domain(email: str) -> str:
    """Extract domain from email address."""
    return email.split("@")[-1].lower() if "@" in email else ""


def _get_url_domain(url: str) -> str:
    """Extract the domain from a URL."""
    url = url.lower().replace("https://", "").replace("http://", "").replace("www.", "")
    return url.split("/")[0].split("?")[0]


# ─── Scoring Functions ───────────────────────────────────────────────────────

def extract_and_score_email(text: str) -> Tuple[int, List[str]]:
    """
    Score email-related risk factors.
    +30 if free domain (gmail, yahoo, outlook, etc.)
    +25 if domain mismatch with company name
    """
    score = 0
    flags = []
    emails = _extract_emails(text)
    companies = _extract_company_names(text)

    if not emails:
        return score, flags

    for email in emails:
        domain = _get_domain(email)

        # Free email domain check
        if domain in FREE_EMAIL_DOMAINS:
            score += 30
            flags.append(f"Free email used ({domain}) instead of company domain")
            break

    # Domain vs company name mismatch (only for non-free domains)
    if companies and emails:
        for email in emails:
            domain = _get_domain(email)
            if domain not in FREE_EMAIL_DOMAINS:
                domain_name = domain.split(".")[0].lower()
                for company in companies:
                    company_clean = re.sub(r'[^a-z0-9]', '', company.lower())
                    if len(company_clean) >= 3 and company_clean not in domain_name and domain_name not in company_clean:
                        score += 25
                        flags.append("Company name does not match email domain")
                        break
                break

    # Big company impersonation via free email
    if companies and emails:
        for company in companies:
            company_lower = company.lower()
            if company_lower in BIG_COMPANY_NAMES:
                for email in emails:
                    domain = _get_domain(email)
                    if domain in FREE_EMAIL_DOMAINS or company_lower not in domain:
                        score += 20
                        flags.append(f"Possible {company.capitalize()} impersonation via unofficial email")
                        break
                break

    return min(score, 55), flags


def extract_and_score_url(text: str) -> Tuple[int, List[str]]:
    """
    Score URL-related risk factors.
    +35 for suspicious TLD (.xyz, .top, etc.)
    +10 if not HTTPS
    +20 if domain does not match company name
    +15 if big company name in domain but domain is not official
    """
    score = 0
    flags = []
    urls = _extract_urls(text)
    companies = _extract_company_names(text)

    if not urls:
        return score, flags

    for url in urls[:3]:  # Check up to 3 URLs
        url_domain = _get_url_domain(url)

        # Suspicious TLD check
        tld_found = False
        for tld in SUSPICIOUS_TLDS:
            if url_domain.endswith(tld):
                score += 35
                flags.append(f"Suspicious URL domain extension ({tld})")
                tld_found = True
                break

        # No HTTPS
        if url.startswith("http://") or url.startswith("www."):
            score += 10
            flags.append("Website does not use HTTPS (insecure)")

        # Big company name in URL but unofficial domain
        # e.g. "amazon-careers-job.xyz" contains "amazon" but is not amazon.com
        for company in BIG_COMPANY_NAMES:
            if company in url_domain:
                official_domains = [company + ".com", company + ".in", company + ".co.in"]
                is_official = any(url_domain == od or url_domain.endswith("." + od) for od in official_domains)
                if not is_official:
                    score += 25
                    flags.append(f"Fake {company.capitalize()} domain detected")
                break

        # Domain vs company mismatch (non-big-brand cases)
        if companies and not tld_found:
            domain_name = url_domain.split(".")[0].lower()
            for company in companies:
                company_clean = re.sub(r'[^a-z0-9]', '', company.lower())
                if len(company_clean) >= 3 and company_clean not in domain_name and domain_name not in company_clean:
                    score += 20
                    flags.append("Website domain does not match company name")
                    break

        break  # Only score first URL

    return min(score, 65), flags


def score_contact_methods(text: str) -> Tuple[int, List[str]]:
    """
    Score contact method risk factors.
    +20 if WhatsApp mentioned
    +25 if Telegram mentioned
    +10 if Indian phone number detected
    """
    score = 0
    flags = []
    text_lower = text.lower()

    if "whatsapp" in text_lower or "whats app" in text_lower or "wa.me" in text_lower:
        score += 20
        flags.append("WhatsApp contact used (unprofessional for hiring)")

    if "telegram" in text_lower or "t.me/" in text_lower:
        score += 25
        flags.append("Telegram contact used (unprofessional for hiring)")

    # Indian phone number: +91 optionally followed by space/dash then 10 digits
    # Also matches without +, e.g. "91 9876543210" (common in OCR output)
    indian_phone_patterns = [
        r'\+91[\s\-]?\d{10}',        # +919876543210 or +91 9876543210
        r'(?<!\d)91[\s\-]\d{10}',    # 91 9876543210 (OCR drops the +)
        r'(?<!\d)0\d{10}(?!\d)',      # 09876543210 (landline/mobile)
    ]
    for pattern in indian_phone_patterns:
        if re.search(pattern, text):
            score += 10
            flags.append("Indian mobile number detected")
            break

    return min(score, 55), flags


def score_urgency_language(text: str) -> Tuple[int, List[str]]:
    """
    Score urgency/scam language.
    +10 per urgency keyword found (up to 30 total).
    """
    score = 0
    flags = []
    text_lower = text.lower()
    found = []

    for keyword in URGENT_KEYWORDS:
        if keyword in text_lower:
            found.append(keyword)

    if found:
        score = min(len(found) * 10, 30)
        if len(found) >= 3:
            flags.append(f"High-pressure language detected: \"{found[0]}\", \"{found[1]}\" and more")
        elif found:
            flags.append(f"Urgency language detected: \"{found[0]}\"")

    return score, flags


def score_consistency(text: str) -> Tuple[int, List[str]]:
    """
    Score consistency between company name and email domain.
    +30 if company name does not match email domain.
    """
    score = 0
    flags = []
    emails = _extract_emails(text)
    companies = _extract_company_names(text)

    if not emails or not companies:
        return score, flags

    for email in emails:
        domain = _get_domain(email)
        if domain in FREE_EMAIL_DOMAINS:
            domain_name = domain.split(".")[0]
        else:
            domain_name = domain.split(".")[0].lower()

        for company in companies:
            company_clean = re.sub(r'[^a-z0-9]', '', company.lower())
            if domain in FREE_EMAIL_DOMAINS or (
                len(company_clean) >= 3 and
                company_clean not in domain_name and
                domain_name not in company_clean
            ):
                score += 30
                flags.append("Company name does not match email domain")
                return min(score, 30), flags

    return min(score, 30), flags


# ─── Main Entry Point ────────────────────────────────────────────────────────

def compute_verification(text: str) -> Dict:
    """
    Run all verification checks on the given text.
    Returns:
        {
            "verification_score": int (0-100),
            "email_score": int,
            "url_score": int,
            "contact_score": int,
            "consistency_score": int,
            "urgency_score": int,
            "flags": List[str]
        }
    """
    email_score, email_flags = extract_and_score_email(text)
    url_score, url_flags = extract_and_score_url(text)
    contact_score, contact_flags = score_contact_methods(text)
    consistency_score, consistency_flags = score_consistency(text)
    urgency_score, urgency_flags = score_urgency_language(text)

    # Combine all flags (deduplicate, preserve order)
    all_flags = []
    seen = set()
    for flag in email_flags + url_flags + contact_flags + consistency_flags + urgency_flags:
        if flag not in seen:
            all_flags.append(flag)
            seen.add(flag)

    raw_score = email_score + url_score + contact_score + consistency_score + urgency_score
    verification_score = min(raw_score, 100)

    return {
        "verification_score": verification_score,
        "email_score": email_score,
        "url_score": url_score,
        "contact_score": contact_score,
        "consistency_score": consistency_score,
        "flags": all_flags,
    }
