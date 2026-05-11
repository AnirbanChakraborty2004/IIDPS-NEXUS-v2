import platform
import subprocess
import logging
import redis
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class IPBlocker:
    def __init__(self, redis_url="redis://localhost:6379/0", simulation_mode=True):
        self.simulation_mode = simulation_mode
        self.os_type = platform.system()
        try:
            self.redis_client = redis.from_url(redis_url)
        except Exception as e:
            logger.error(f"Could not connect to Redis: {e}")
            self.redis_client = None

    def block_ip(self, ip_address, reason="Malicious Activity"):
        """Blocks an IP address dynamically based on OS or Simulation Mode."""
        logger.warning(f"Initiating block for IP: {ip_address} | Reason: {reason}")
        
        # 1. Save to Redis Blocklist
        if self.redis_client:
            block_data = {
                "ip": ip_address,
                "reason": reason,
                "timestamp": datetime.utcnow().isoformat()
            }
            self.redis_client.hset("iidps_blocklist", ip_address, json.dumps(block_data))
            # Publish event for WebSockets
            self.redis_client.publish("threat_alerts", json.dumps({"type": "IP_BLOCKED", "data": block_data}))

        if self.simulation_mode:
            logger.info(f"[SIMULATION] Successfully simulated blocking IP: {ip_address}")
            return True

        # 2. Execute actual OS-level firewall rules
        try:
            if self.os_type == "Windows":
                cmd = f'netsh advfirewall firewall add rule name="IIDPS_BLOCK_{ip_address}" dir=in action=block remoteip={ip_address}'
                subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                logger.info(f"[WINDOWS FIREWALL] Blocked IP: {ip_address}")
            
            elif self.os_type == "Linux":
                cmd = f'iptables -A INPUT -s {ip_address} -j DROP'
                subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                logger.info(f"[LINUX IPTABLES] Blocked IP: {ip_address}")
                
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to execute firewall command for {ip_address}. Are you running as Admin/Root? Error: {e}")
            return False

    def get_blocklist(self):
        """Retrieves all blocked IPs from Redis."""
        if not self.redis_client:
            return []
        
        raw_list = self.redis_client.hgetall("iidps_blocklist")
        return [json.loads(data) for ip, data in raw_list.items()]
