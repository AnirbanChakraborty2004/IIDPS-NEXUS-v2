from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import logging
import json
from datetime import datetime

from app.prevention.ip_blocker import IPBlocker
from app.voice_assistant.command_processor import ServerVoiceAssistant
from app.api.link_checker import router as link_router

logger = logging.getLogger(__name__)
api_router = APIRouter()

ip_blocker = IPBlocker()
voice_assistant = ServerVoiceAssistant()


# ── Request models ─────────────────────────────────────────────────────────────

class VoiceCommand(BaseModel):
    text: str

class BlockIPRequest(BaseModel):
    ip: str
    reason: str = "Manual block via Quick Actions"

class BlockURLRequest(BaseModel):
    url: str


# ── Existing routes ────────────────────────────────────────────────────────────

@api_router.get("/stats")
def get_system_stats():
    """Returns overall system statistics for the dashboard."""
    return {
        "status": "Active",
        "packets_per_sec": 450,
        "bytes_per_sec": 1024000,
        "active_threats": 0,
        "total_blocked_ips": len(ip_blocker.get_blocklist()),
    }


@api_router.get("/blocklist")
def get_blocklist():
    """Returns the list of currently blocked IPs."""
    return ip_blocker.get_blocklist()


@api_router.post("/voice/command")
def process_voice_command(command: VoiceCommand):
    """Processes a voice command and returns the response text."""
    try:
        response_text = voice_assistant.process_text_command(command.text)
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process voice command.")


# ── New routes for Quick Actions ───────────────────────────────────────────────

@api_router.post("/block-ip")
def block_ip(req: BlockIPRequest):
    """Manually block an IP address."""
    success = ip_blocker.block_ip(req.ip, reason=req.reason)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to block IP. Check admin/root permissions."
        )
    return {"status": "blocked", "ip": req.ip, "reason": req.reason}


@api_router.post("/block-url")
def block_url(req: BlockURLRequest):
    """Add a URL/domain to the blocklist."""
    ip_blocker.block_url(req.url)
    return {"status": "blocked", "url": req.url}


@api_router.get("/url-blocklist")
def get_url_blocklist():
    """Returns the list of blocked URLs."""
    return ip_blocker.get_url_blocklist()


# ── Sub-routers ────────────────────────────────────────────────────────────────

api_router.include_router(link_router)