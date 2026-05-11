import logging
from .ip_blocker import IPBlocker
from .alert_manager import AlertManager, AlertLevel

logger = logging.getLogger(__name__)

class AutoResponseSystem:
    def __init__(self, simulation_mode=True):
        self.ip_blocker = IPBlocker(simulation_mode=simulation_mode)
        self.alert_manager = AlertManager()
        self.auto_block_threshold = 90.0 # Confidence % required to auto-block

    def process_prediction(self, prediction_result):
        """
        Receives a single prediction dictionary from the ML Predictor.
        Decides whether to alert, block, or ignore.
        """
        if not prediction_result.get("is_threat", False):
            return None # Normal traffic

        flow_id = prediction_result["flow_id"]
        threat_type = prediction_result["prediction"]
        confidence = prediction_result["confidence"]

        # 1. Generate Alert
        alert = self.alert_manager.create_alert(flow_id, threat_type, confidence)

        # 2. Automated Prevention Action
        if confidence >= self.auto_block_threshold and alert["level"] in [AlertLevel.HIGH, AlertLevel.CRITICAL]:
            src_ip = alert["source_ip"]
            if src_ip != "Unknown":
                logger.info(f"Auto-Response Triggered: Confidence ({confidence}%) exceeds threshold.")
                self.ip_blocker.block_ip(src_ip, reason=threat_type)
                alert["action_taken"] = "IP_BLOCKED"
            else:
                alert["action_taken"] = "NO_ACTION_UNKNOWN_IP"
        else:
            alert["action_taken"] = "MONITORING"

        return alert
