import time
from collections import defaultdict
from scapy.layers.inet import IP, TCP, UDP

class FeatureExtractor:
    def __init__(self, time_window=1.0):
        self.time_window = time_window  # window in seconds to calculate rates
        self.current_window_start = time.time()
        
        # flow key: (src_ip, dst_ip, src_port, dst_port, protocol)
        self.flows = defaultdict(lambda: {
            "packet_count": 0,
            "byte_count": 0,
            "start_time": time.time(),
            "last_time": time.time(),
            "flags": set()
        })

    def extract_features(self, packets):
        """
        Takes a list of raw scapy packets, groups them into flows,
        and extracts statistical features required by the ML model.
        """
        current_time = time.time()
        extracted_features = []

        for pkt in packets:
            if IP in pkt:
                src_ip = pkt[IP].src
                dst_ip = pkt[IP].dst
                proto = pkt[IP].proto
                length = len(pkt)
                
                src_port = 0
                dst_port = 0
                flags = ""

                if TCP in pkt:
                    src_port = pkt[TCP].sport
                    dst_port = pkt[TCP].dport
                    flags = str(pkt[TCP].flags)
                elif UDP in pkt:
                    src_port = pkt[UDP].sport
                    dst_port = pkt[UDP].dport

                flow_key = f"{src_ip}:{src_port}->{dst_ip}:{dst_port}_{proto}"
                
                flow = self.flows[flow_key]
                flow["packet_count"] += 1
                flow["byte_count"] += length
                flow["last_time"] = current_time
                if flags:
                    flow["flags"].add(flags)

        # Check if time window has passed to generate features
        if current_time - self.current_window_start >= self.time_window:
            for flow_key, flow_data in list(self.flows.items()):
                duration = max(0.001, flow_data["last_time"] - flow_data["start_time"])
                
                # Features for ML Model (Simulating CICIDS2017 style)
                features = {
                    "flow_id": flow_key,
                    "duration": duration,
                    "total_packets": flow_data["packet_count"],
                    "total_bytes": flow_data["byte_count"],
                    "packets_per_sec": flow_data["packet_count"] / duration,
                    "bytes_per_sec": flow_data["byte_count"] / duration,
                    "timestamp": current_time
                }
                extracted_features.append(features)
                
                # Reset flow for next window
                flow_data["packet_count"] = 0
                flow_data["byte_count"] = 0
                flow_data["start_time"] = current_time
            
            self.current_window_start = current_time
            
            # Clean up old dead flows
            self._cleanup_old_flows(current_time)

        return extracted_features

    def _cleanup_old_flows(self, current_time, timeout=60):
        """Removes flows that haven't seen packets in a while"""
        keys_to_delete = []
        for key, flow in self.flows.items():
            if current_time - flow["last_time"] > timeout:
                keys_to_delete.append(key)
        for key in keys_to_delete:
            del self.flows[key]
