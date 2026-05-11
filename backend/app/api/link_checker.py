"""
Google Safe Browsing v4 + strong server-side heuristics.
"""

import os
import re
import httpx
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings

router = APIRouter(tags=["Link Checker"])

GSB_API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
API_KEY     = settings.GOOGLE_SAFE_BROWSING_API_KEY


# ── Models ─────────────────────────────────────────────────────────────────

class LinkCheckRequest(BaseModel):
    url: str

class ThreatMatch(BaseModel):
    threatType:   str
    platformType: str
    threat:       dict

class HeuristicFlag(BaseModel):
    rule:    str
    detail:  str
    level:   str   # "warning" | "danger"

class LinkCheckResponse(BaseModel):
    url:             str
    safe:            bool
    threats:         list[ThreatMatch]
    heuristic_flags: list[HeuristicFlag]
    risk_level:      str    # "safe" | "warning" | "danger"
    message:         str


# ── Heuristic engine ───────────────────────────────────────────────────────

# Free/abused TLDs heavily used in phishing
SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top",
    ".click", ".link", ".work", ".loan", ".win", ".download",
    ".stream", ".gdn", ".racing", ".accountant", ".science",
}

# Domains that are commonly spoofed
SPOOFED_BRANDS = [
    "paypal", "apple", "google", "microsoft", "amazon", "netflix",
    "facebook", "instagram", "twitter", "linkedin", "bankofamerica",
    "chase", "wellsfargo", "hsbc", "steam", "discord", "roblox",
]

# Keywords that appear in domain/path of phishing URLs
PHISHING_KEYWORDS = [
    "secure-login", "verify-account", "confirm-identity", "suspended",
    "update-billing", "free-iphone", "win-prize", "click-here-now",
    "login-confirm", "account-locked", "unusual-activity",
    "reset-password", "support-ticket", "refund-process",
]

def _heuristic_check(parsed: urlparse) -> list[HeuristicFlag]:
    flags: list[HeuristicFlag] = []
    full   = parsed.geturl().lower()
    host   = (parsed.hostname or "").lower()
    path   = (parsed.path or "").lower()
    scheme = (parsed.scheme or "").lower()

    # 1. No HTTPS
    if scheme == "http":
        flags.append(HeuristicFlag(
            rule="NO_HTTPS",
            detail="Connection is unencrypted (HTTP). Data can be intercepted.",
            level="warning",
        ))

    # 2. Raw IP address instead of domain
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host):
        flags.append(HeuristicFlag(
            rule="RAW_IP_ADDRESS",
            detail=f"URL uses a raw IP ({host}) instead of a domain name — common in malware C2.",
            level="danger",
        ))

    # 3. Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if host.endswith(tld):
            flags.append(HeuristicFlag(
                rule="SUSPICIOUS_TLD",
                detail=f"TLD '{tld}' is heavily abused for phishing and spam.",
                level="warning",
            ))
            break

    # 4. URL shorteners
    shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
                  "rb.gy", "shorturl.at", "is.gd", "buff.ly", "cutt.ly"]
    if any(s in host for s in shorteners):
        flags.append(HeuristicFlag(
            rule="URL_SHORTENER",
            detail=f"URL shortener detected ({host}). Final destination is hidden.",
            level="warning",
        ))

    # 5. @ symbol in URL (hides real destination)
    if "@" in full:
        flags.append(HeuristicFlag(
            rule="AT_SYMBOL_IN_URL",
            detail="'@' in URL redirects browser to a different host — classic phishing trick.",
            level="danger",
        ))

    # 6. Non-ASCII / punycode (IDN homograph attack)
    if re.search(r"[^\x00-\x7F]", host) or "xn--" in host:
        flags.append(HeuristicFlag(
            rule="PUNYCODE_DOMAIN",
            detail="Domain uses non-ASCII or punycode characters — possible IDN homograph attack.",
            level="danger",
        ))

    # 7. Excessive subdomains (e.g. paypal.com.verify.login.evil.com)
    parts = host.split(".")
    if len(parts) >= 5:
        flags.append(HeuristicFlag(
            rule="EXCESSIVE_SUBDOMAINS",
            detail=f"Domain has {len(parts)} levels — often used to disguise the real domain.",
            level="warning",
        ))

    # 8. Brand name in subdomain (not the actual brand domain)
    for brand in SPOOFED_BRANDS:
        if brand in host:
            # Allow if host IS exactly the brand domain e.g. paypal.com
            domain_root = ".".join(parts[-2:]) if len(parts) >= 2 else host
            if brand not in domain_root:
                flags.append(HeuristicFlag(
                    rule="BRAND_SPOOFING",
                    detail=f"'{brand}' appears in subdomain of a different domain — likely spoofing.",
                    level="danger",
                ))
                break

    # 9. Phishing keywords in domain or path
    for kw in PHISHING_KEYWORDS:
        if kw in host or kw in path:
            flags.append(HeuristicFlag(
                rule="PHISHING_KEYWORD",
                detail=f"Phishing keyword '{kw}' found in URL.",
                level="warning",
            ))
            break

    # 10. Excessive hyphens in domain (typosquatting)
    if host.count("-") >= 3:
        flags.append(HeuristicFlag(
            rule="EXCESSIVE_HYPHENS",
            detail=f"Domain contains {host.count('-')} hyphens — common in typosquatting.",
            level="warning",
        ))

    # 11. Very long URL (obfuscation)
    if len(parsed.geturl()) > 200:
        flags.append(HeuristicFlag(
            rule="EXCESSIVELY_LONG_URL",
            detail=f"URL is {len(parsed.geturl())} characters — may be obfuscating destination.",
            level="warning",
        ))

    # 12. Port number in URL (non-standard)
    if parsed.port and parsed.port not in (80, 443):
        flags.append(HeuristicFlag(
            rule="NON_STANDARD_PORT",
            detail=f"URL uses port {parsed.port} — legitimate sites rarely use non-standard ports.",
            level="warning",
        ))

    # 13. Double slashes in path (obfuscation)
    if "//" in path:
        flags.append(HeuristicFlag(
            rule="DOUBLE_SLASH_PATH",
            detail="Double slashes in path — may be an attempt to confuse parsers.",
            level="warning",
        ))

    return flags


# ── GSB payload ────────────────────────────────────────────────────────────

def _build_payload(url: str) -> dict:
    return {
        "client": {"clientId": "iidps-nexus", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": [
                "MALWARE", "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            "platformTypes":    ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries":    [{"url": url}],
        },
    }


# ── Route ──────────────────────────────────────────────────────────────────

@router.post("/link/check", response_model=LinkCheckResponse)
async def check_link(body: LinkCheckRequest):
    url = body.url.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    # Parse URL
    try:
        parsed = urlparse(url)
        if not parsed.hostname:
            raise ValueError
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid URL.")

    # Run heuristics
    heuristic_flags = _heuristic_check(parsed)

    # GSB check
    threats: list[ThreatMatch] = []
    if API_KEY:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(
                    GSB_API_URL, params={"key": API_KEY}, json=_build_payload(url)
                )
                resp.raise_for_status()
                matches = resp.json().get("matches", [])
                threats = [
                    ThreatMatch(
                        threatType   = m.get("threatType",   "THREAT_TYPE_UNSPECIFIED"),
                        platformType = m.get("platformType", "ANY_PLATFORM"),
                        threat       = m.get("threat",       {}),
                    )
                    for m in matches
                ]
            except httpx.TimeoutException:
                raise HTTPException(status_code=504, detail="Google Safe Browsing API timed out.")
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=502, detail=f"GSB API error: {e.response.status_code}")
    else:
        raise HTTPException(status_code=503, detail="GOOGLE_SAFE_BROWSING_API_KEY not configured.")

    # Determine overall risk level
    has_danger_heuristic = any(f.level == "danger" for f in heuristic_flags)
    has_warning_heuristic = any(f.level == "warning" for f in heuristic_flags)
    has_gsb_threat = len(threats) > 0
    has_gsb_danger = any(
        t.threatType in ("MALWARE", "SOCIAL_ENGINEERING") for t in threats
    )

    if has_gsb_danger or has_danger_heuristic:
        risk_level = "danger"
    elif has_gsb_threat or has_warning_heuristic:
        risk_level = "warning"
    else:
        risk_level = "safe"

    # Build message
    parts = []
    if threats:
        labels = ", ".join(set(t.threatType for t in threats))
        parts.append(f"GSB threat: {labels}")
    if heuristic_flags:
        rules = ", ".join(f.rule for f in heuristic_flags)
        parts.append(f"Heuristic flags: {rules}")
    message = " | ".join(parts) if parts else "✓ No threats found."

    return LinkCheckResponse(
        url             = url,
        safe            = risk_level == "safe",
        threats         = threats,
        heuristic_flags = heuristic_flags,
        risk_level      = risk_level,
        message         = message,
    )