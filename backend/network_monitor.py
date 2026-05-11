import asyncio
import os
import psutil
import json
import redis
from collections import deque
from datetime import datetime
from ml_engine import ml_model
from database import SessionLocal, Alert

# Connect to Redis
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.from_url(REDIS_URL)
except Exception as e:
    print(f"Could not connect to Redis: {e}")
    redis_client = None

# Thread-safe(ish) global state for the dashboard
traffic_stats = {
    "bandwidth_mbps": 0.0,
    "active_connections": 0,
    "threats_blocked": 0,
    "defcon_level": 5
}

# Keep the last 20 alerts
recent_alerts = deque(maxlen=20)

# Track previous connections to detect new ones
prev_remote_ips = set()

def get_live_connections():
    """
    Gets real connection stats from psutil.
    Returns: (conn_count, unique_ports, top_source_ip)
    """
    try:
        conns = psutil.net_connections(kind='inet')
        
        remote_ips = {}
        unique_ports = set()
        
        for c in conns:
            if c.raddr:
                ip = c.raddr.ip
                port = c.raddr.port
                unique_ports.add(port)
                remote_ips[ip] = remote_ips.get(ip, 0) + 1
            if c.laddr:
                # Also count local listening ports being connected to
                unique_ports.add(c.laddr.port)
        
        conn_count = len(conns)
        port_count = len(unique_ports)
        
        # Find the IP with the most connections (likely the attacker)
        top_ip = "Unknown"
        if remote_ips:
            top_ip = max(remote_ips, key=remote_ips.get)
        
        return conn_count, port_count, top_ip, remote_ips
        
    except psutil.AccessDenied:
        output = os.popen('netstat -an').read()
        lines = [line for line in output.split('\n') if 'TCP' in line or 'UDP' in line]
        return len(lines), 1, "Unknown", {}
    except Exception as e:
        print(f"[Network Monitor] Connection error: {e}")
        return 0, 0, "Unknown", {}

async def traffic_simulator_loop():
    """
    Monitors live network traffic continuously via psutil, feeds it to the ML engine, 
    and updates the global stats accessible via the API.
    """
    print("[Network Monitor] Hardware OS monitoring loop starting...")
    
    last_io = psutil.net_io_counters()

    while True:
        await asyncio.sleep(2) # Update every 2 seconds
        
        # 1. LIVE BANDWIDTH CALCULATION
        current_io = psutil.net_io_counters()
        bytes_sent = current_io.bytes_sent - last_io.bytes_sent
        bytes_recv = current_io.bytes_recv - last_io.bytes_recv
        last_io = current_io
        
        total_mb = (bytes_sent + bytes_recv) / (1024 * 1024)
        bw_mbps = total_mb / 2.0  # divided by 2 seconds interval
        
        # 2. LIVE CONNECTION SOCKET TRACKING (now extracts real IPs)
        conn, ports, top_ip, remote_ips = get_live_connections()
        auths = 0 
            
        # Update current stats
        traffic_stats["bandwidth_mbps"] = round(bw_mbps, 3)
        traffic_stats["active_connections"] = conn
        
        # Debug logging
        print(f"[Monitor] BW: {bw_mbps:.3f} MB/s | Conns: {conn} | Ports: {ports} | Top IP: {top_ip}")
        
        # Run ML Prediction
        try:
            prediction = ml_model.predict(bw_mbps, conn, ports, auths)
            
            if prediction["is_anomaly"]:
                traffic_stats["threats_blocked"] += 1
                now_utc = datetime.utcnow()
                
                # Use the REAL source IP from psutil, not a random one
                source_ip = top_ip if top_ip != "Unknown" else "External Source"
                
                new_alert = {
                    "type": str(prediction["threat_type"]),
                    "ip": source_ip,
                    "target": "Local System",
                    "time": now_utc.isoformat(),
                    "severity": "critical" if prediction["confidence"] > 90 else "high",
                    "action": "Blocked",
                    "confidence": f"{prediction['confidence']}%"
                }

                print(f"[ALERT] {prediction['threat_type']} detected from {source_ip} (confidence: {prediction['confidence']}%)")

                # Save to PostgreSQL
                try:
                    db = SessionLocal()
                    db_alert = Alert(
                        type=new_alert["type"],
                        ip=new_alert["ip"],
                        target=new_alert["target"],
                        time=now_utc,
                        severity=new_alert["severity"],
                        action=new_alert["action"],
                        confidence=new_alert["confidence"]
                    )
                    db.add(db_alert)
                    db.commit()
                    db.refresh(db_alert)
                    new_alert["id"] = db_alert.id
                    db.close()
                except Exception as e:
                    print(f"DB Error: {e}")
                    new_alert["id"] = int(now_utc.timestamp() * 1000)

                recent_alerts.appendleft(new_alert)
                
                # Update DEFCON automatically based on recent threats
                traffic_stats["defcon_level"] = max(1, 5 - min(4, len(recent_alerts) // 2))

                # Publish to Redis for real-time WebSocket push
                if redis_client:
                    try:
                        redis_client.publish("threat_alerts", json.dumps({"type": "NEW_ALERT", "data": new_alert}))
                    except Exception as e:
                        print(f"Redis Error: {e}")
                
        except Exception as e:
            print(f"[Network Monitor] Error during ML prediction: {e}")
