import logging
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)

class AlertLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class AlertManager:
    def __init__(self):
        self.alerts = []

    def determine_severity(self, threat_type, confidence):
        """Determines the severity of the alert based on ML confidence and threat type."""
        if threat_type == "DDoS" and confidence > 90:
            return AlertLevel.CRITICAL
        elif threat_type == "DDoS" or (threat_type == "Port Scan" and confidence > 85):
            return AlertLevel.HIGH
        elif threat_type == "Port Scan":
            return AlertLevel.MEDIUM
        return AlertLevel.LOW

    def create_alert(self, flow_id, threat_type, confidence):
        """Generates a structured alert dictionary."""
        severity = self.determine_severity(threat_type, confidence)
        
        # Parse flow ID (e.g., "192.168.1.5:443->10.0.0.2:80_6")
        try:
            src_ip = flow_id.split(":")[0]
        except Exception:
            src_ip = "Unknown"

        alert = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": severity,
            "threat_type": threat_type,
            "source_ip": src_ip,
            "flow_id": flow_id,
            "confidence": confidence,
            "message": f"Detected {threat_type} from {src_ip} with {confidence}% confidence."
        }
        
        self.alerts.append(alert)
        logger.warning(f"[ALERT] {severity.upper()}: {alert['message']}")
        
        # Note: In Phase 6 (API), this will be pushed to PostgreSQL
        return alert
