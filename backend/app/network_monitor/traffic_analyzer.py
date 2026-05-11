import time
import threading
import logging
from .packet_capture import PacketCaptureSystem
from .feature_extractor import FeatureExtractor

logger = logging.getLogger(__name__)

class TrafficAnalyzer:
    def __init__(self, interface=None):
        self.capture_system = PacketCaptureSystem(interface=interface)
        self.extractor = FeatureExtractor(time_window=1.0)
        self.is_analyzing = False
        self.analysis_thread = None
        self.latest_features = []

    def start(self):
        """Starts both capture and analysis loops."""
        if self.is_analyzing:
            return
            
        self.is_analyzing = True
        self.capture_system.start_capture()
        
        self.analysis_thread = threading.Thread(
            target=self._analysis_loop,
            daemon=True
        )
        self.analysis_thread.start()
        logger.info("Traffic Analyzer started.")

    def _analysis_loop(self):
        """Continuously pulls packets, extracts features, and buffers them."""
        while self.is_analyzing:
            packets = self.capture_system.get_packets(max_packets=500)
            if packets:
                features = self.extractor.extract_features(packets)
                if features:
                    # Keep only the most recent features in buffer
                    self.latest_features = features
                    # In Phase 3, this is where we will call ML_Engine.predict(features)
            else:
                time.sleep(0.1) # Sleep briefly if no packets to save CPU

    def stop(self):
        """Stops the analyzer and capture system."""
        self.is_analyzing = False
        self.capture_system.stop_capture()
        if self.analysis_thread:
            self.analysis_thread.join(timeout=2)
        logger.info("Traffic Analyzer stopped.")

    def get_latest_flows(self):
        """Returns the most recent calculated flow statistics."""
        return self.latest_features
