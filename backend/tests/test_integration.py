import unittest
from app.ml_engine.predictor import RealTimePredictor
from app.prevention.auto_response import AutoResponseSystem

class TestEndToEndIntegration(unittest.TestCase):
    def setUp(self):
        # Use a mocked predictor to avoid needing the physical model file for the test
        self.auto_response = AutoResponseSystem(simulation_mode=True)
        
    def test_full_pipeline_ddos(self):
        """Simulates Capture -> Detect -> Prevent -> Alert"""
        # 1. Simulated Capture/Extraction Feature Vector
        mock_features = {
            "flow_id": "192.168.1.50:4444->10.0.0.5:80_6",
            "duration": 0.5,
            "total_packets": 5000,
            "total_bytes": 5000 * 64,
            "packets_per_sec": 10000.0,
            "bytes_per_sec": 640000.0,
            "timestamp": 1600000000.0
        }
        
        # 2. Simulated ML Detection (High Confidence DDoS)
        mock_prediction = {
            "flow_id": mock_features["flow_id"],
            "timestamp": mock_features["timestamp"],
            "prediction": "DDoS",
            "confidence": 98.5,
            "is_threat": True
        }
        
        # 3. Auto Response & Prevention
        alert = self.auto_response.process_prediction(mock_prediction)
        
        # 4. Assertions
        self.assertIsNotNone(alert)
        self.assertEqual(alert["level"], "Critical")
        self.assertEqual(alert["action_taken"], "IP_BLOCKED")
        self.assertEqual(alert["source_ip"], "192.168.1.50")

if __name__ == '__main__':
    unittest.main()
