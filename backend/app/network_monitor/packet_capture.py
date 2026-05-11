import threading
from scapy.all import sniff
from queue import Queue
import logging

logger = logging.getLogger(__name__)

class PacketCaptureSystem:
    def __init__(self, interface=None):
        self.interface = interface
        self.packet_queue = Queue()
        self.is_capturing = False
        self.capture_thread = None

    def _packet_handler(self, packet):
        """Callback function for each captured packet."""
        if self.is_capturing:
            self.packet_queue.put(packet)

    def start_capture(self):
        """Starts the packet sniffing in a separate thread."""
        if self.is_capturing:
            logger.warning("Capture is already running.")
            return

        self.is_capturing = True
        logger.info(f"Starting packet capture on interface: {self.interface or 'default'}")
        
        # Run sniff in a daemon thread so it exits when main program exits
        self.capture_thread = threading.Thread(
            target=self._run_sniff,
            daemon=True
        )
        self.capture_thread.start()

    def _run_sniff(self):
        try:
            # store=False ensures we don't eat up RAM
            sniff(iface=self.interface, prn=self._packet_handler, store=False, stop_filter=lambda x: not self.is_capturing)
        except Exception as e:
            logger.error(f"Error during packet capture: {e}")
            self.is_capturing = False

    def stop_capture(self):
        """Stops the packet capture."""
        self.is_capturing = False
        if self.capture_thread:
            self.capture_thread.join(timeout=2)
        logger.info("Packet capture stopped.")

    def get_packets(self, max_packets=100):
        """Retrieves packets from the queue."""
        packets = []
        while not self.packet_queue.empty() and len(packets) < max_packets:
            packets.append(self.packet_queue.get())
        return packets
