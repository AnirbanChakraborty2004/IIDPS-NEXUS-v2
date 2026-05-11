from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import asyncio
import json
import os
import urllib.request
import redis.asyncio as aioredis
import redis

from ml_engine import ml_model
from network_monitor import traffic_simulator_loop, traffic_stats, recent_alerts
from database import init_db, SessionLocal, Alert
from app.voice_assistant.command_processor import ServerVoiceAssistant

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
voice_assistant = ServerVoiceAssistant()

class VoiceCommand(BaseModel):
    text: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

async def redis_listener():
    try:
        redis_client = aioredis.from_url(REDIS_URL)
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("threat_alerts")
        async for message in pubsub.listen():
            if message["type"] == "message":
                await manager.broadcast(message["data"].decode("utf-8"))
    except Exception as e:
        print(f"Redis listener error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up IIDPS Backend...")
    print("🧠 LLM Core: Google Gemini (via Puter.js) — Cloud-based speed.")
    init_db()
    # Train the ML model on startup using the synthetic dataset
    ml_model.train()
    
    # Start the network monitor task
    sim_task = asyncio.create_task(traffic_simulator_loop())
    redis_task = asyncio.create_task(redis_listener())
    
    yield
    print("🛑 Shutting down IIDPS Backend...")
    sim_task.cancel()
    redis_task.cancel()

app = FastAPI(title="IIDPS NEXUS API", lifespan=lifespan)

# Allow Frontend to communicate with the Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "IIDPS Backend is running.", "llm": "Google Gemini (Puter.js Integration)"}

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/status")
def get_status():
    return {
        "status": "online",
        "threat_level": f"DEFCON {traffic_stats['defcon_level']}",
        "message": f"System is operating at DEFCON {traffic_stats['defcon_level']}. {traffic_stats['threats_blocked']} threats contained."
    }

@app.get("/api/dashboard")
def get_dashboard_data():
    db = SessionLocal()
    alerts = db.query(Alert).order_by(Alert.id.desc()).limit(20).all()
    alerts_data = [
        {
            "id": a.id,
            "type": a.type,
            "ip": a.ip,
            "target": a.target,
            "time": a.time.isoformat(),
            "severity": a.severity,
            "action": a.action,
            "confidence": a.confidence
        } for a in alerts
    ]
    db.close()
    return {
        "stats": traffic_stats,
        "recent_alerts": alerts_data
    }

@app.post("/api/actions/clear-logs")
def clear_logs():
    db = SessionLocal()
    db.query(Alert).delete()
    db.commit()
    db.close()
    recent_alerts.clear()
    traffic_stats["defcon_level"] = 5
    return {"status": "success", "message": "Threat logs cleared and DEFCON reset to 5."}

import random

ATTACK_PROFILES = {
    "dos": {
        "type": "DoS",
        "ips": ["203.45.6.78", "185.220.101.5", "91.240.118.222"],
        "targets": ["10.0.0.5:80", "10.0.0.10:443", "10.0.0.1:8080"],
        "severity": "critical",
        "action": "Blocked",
        "confidence_range": (92.0, 99.9),
    },
    "ddos": {
        "type": "DDoS",
        "ips": ["45.33.32.156", "104.236.198.48", "178.128.0.100", "159.89.0.55"],
        "targets": ["10.0.0.10:80", "10.0.0.10:443"],
        "severity": "critical",
        "action": "Blocked",
        "confidence_range": (95.0, 99.9),
    },
    "port_scan": {
        "type": "Port Scan",
        "ips": ["192.168.1.50", "172.16.0.88", "10.10.10.99"],
        "targets": ["10.0.0.5:22,80,443,3306", "10.0.0.1:21,22,80,8080"],
        "severity": "high",
        "action": "Blocked",
        "confidence_range": (85.0, 98.5),
    },
    "brute_force": {
        "type": "Brute Force",
        "ips": ["45.67.89.12", "114.5.6.7", "89.248.167.131"],
        "targets": ["10.0.0.5:22", "10.0.0.1:3389", "10.0.0.10:21"],
        "severity": "high",
        "action": "Rate Limited",
        "confidence_range": (80.0, 95.0),
    },
    "sql_injection": {
        "type": "SQL Injection",
        "ips": ["77.88.55.60", "195.154.0.22", "5.188.86.10"],
        "targets": ["10.0.0.10:80/api/login", "10.0.0.10:443/api/search"],
        "severity": "critical",
        "action": "Blocked",
        "confidence_range": (88.0, 99.0),
    },
}

def _create_alert(attack_type: str):
    from datetime import datetime
    profile = ATTACK_PROFILES.get(attack_type)
    if not profile:
        profile = random.choice(list(ATTACK_PROFILES.values()))

    now_utc = datetime.utcnow()
    conf = round(random.uniform(*profile["confidence_range"]), 1)

    new_alert = {
        "type": profile["type"],
        "ip": random.choice(profile["ips"]),
        "target": random.choice(profile["targets"]),
        "time": now_utc.isoformat(),
        "severity": profile["severity"],
        "action": profile["action"],
        "confidence": f"{conf}%",
    }

    traffic_stats["threats_blocked"] += 1

    db = SessionLocal()
    db_alert = Alert(
        type=new_alert["type"],
        ip=new_alert["ip"],
        target=new_alert["target"],
        time=now_utc,
        severity=new_alert["severity"],
        action=new_alert["action"],
        confidence=new_alert["confidence"],
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    new_alert["id"] = db_alert.id
    db.close()

    recent_alerts.appendleft(new_alert)
    traffic_stats["defcon_level"] = max(1, 5 - min(4, len(recent_alerts) // 2))

    try:
        r = redis.from_url(REDIS_URL)
        r.publish("threat_alerts", json.dumps({"type": "NEW_ALERT", "data": new_alert}))
    except Exception as e:
        print(f"Redis Error: {e}")

    return new_alert

@app.post("/api/actions/simulate-attack")
def simulate_attack(attack_type: str = "dos"):
    """Simulate a single attack. Types: dos, ddos, port_scan, brute_force, sql_injection"""
    alert = _create_alert(attack_type)
    return {"status": "success", "message": f"{alert['type']} attack simulated from {alert['ip']}.", "alert": alert}

@app.post("/api/actions/simulate-wave")
def simulate_wave():
    """Simulate a wave of 5 random attacks at once to stress-test the system."""
    results = []
    for _ in range(5):
        attack_type = random.choice(list(ATTACK_PROFILES.keys()))
        alert = _create_alert(attack_type)
        results.append(alert)
    return {"status": "success", "message": f"Attack wave complete — {len(results)} threats simulated.", "alerts": results}

@app.post("/api/voice/command")
def process_voice_command(command: VoiceCommand):
    try:
        response_text = voice_assistant.process_text_command(command.text)
        return {"response": response_text}
    except Exception as e:
        print(f"Voice processing error: {e}")
        return {"response": "Voice assistant is currently unavailable."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
