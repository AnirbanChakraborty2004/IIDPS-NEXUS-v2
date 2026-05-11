from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import logging

from app.prevention.ip_blocker import IPBlocker
from app.voice_assistant.command_processor import ServerVoiceAssistant

logger = logging.getLogger(__name__)
api_router = APIRouter()

ip_blocker = IPBlocker()
voice_assistant = ServerVoiceAssistant()

class VoiceCommand(BaseModel):
    text: str

@api_router.get("/stats")
def get_system_stats():
    """Returns overall system statistics for the dashboard."""
    # Mock data for Phase 6 POC. In Phase 8, this will pull from TrafficAnalyzer
    return {
        "status": "Active",
        "packets_per_sec": 450,
        "bytes_per_sec": 1024000,
        "active_threats": 0,
        "total_blocked_ips": len(ip_blocker.get_blocklist())
    }

@api_router.get("/blocklist")
def get_blocklist():
    """Returns the list of currently blocked IPs."""
    return ip_blocker.get_blocklist()

@api_router.post("/voice/command")
def process_voice_command(command: VoiceCommand):
    """
    Receives transcribed text from the Frontend Web Speech API,
    processes it via NLP, and returns the response text to be spoken.
    """
    try:
        response_text = voice_assistant.process_text_command(command.text)
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process voice command.")
