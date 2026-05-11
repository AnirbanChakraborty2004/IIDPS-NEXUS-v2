import re
import logging
from app.prevention.ip_blocker import IPBlocker

logger = logging.getLogger(__name__)

class NLPQueryHandler:
    def __init__(self):
        self.ip_blocker = IPBlocker()
        
    def parse_and_execute(self, text_query: str) -> str:
        """
        Parses a natural language query and executes the corresponding SOC action.
        Returns the text response for the Voice Assistant to speak.
        """
        query = text_query.lower()
        logger.info(f"[VOICE COMMAND RECEIVED]: {query}")

        # 1. Threat Status Query
        if "status" in query or "threat level" in query:
            # Mocking response for POC. In production, query the DB or TrafficAnalyzer
            return "The current threat level is Low. All systems are operating normally."

        # 2. Block IP Command
        # Regex to find an IPv4 address
        ip_match = re.search(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', query)
        if "block" in query and ip_match:
            ip_to_block = ip_match.group()
            success = self.ip_blocker.block_ip(ip_to_block, reason="Manual Voice Command")
            if success:
                return f"Successfully blocked IP address {ip_to_block}."
            else:
                return f"Failed to block IP {ip_to_block}. Please check system permissions."

        # 3. Unblock IP Command
        if "unblock" in query or "allow" in query:
             return "Unblocking IPs via voice is currently disabled for security reasons."

        # 4. System Statistics
        if "stats" in query or "traffic" in query:
             return "We are currently processing approximately 500 packets per second. No active anomalies detected."

        # Fallback
        return "I'm sorry, I didn't understand that command. You can ask for the threat level, or tell me to block a specific IP address."
