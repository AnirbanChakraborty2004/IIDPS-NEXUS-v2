import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier

class IntrusionDetectionModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.is_trained = False
        
    def generate_synthetic_data(self):
        """
        Creates a synthetic dataset representing Normal traffic and various anomalies.
        Tuned for a developer workstation where psutil observes real local traffic.
        Features: 
        - bandwidth_usage_mbps
        - concurrent_connections
        - distinct_dest_ports
        - failed_auth_attempts
        """
        print("[ML Engine] Generating synthetic network data for PoC...")
        
        # 1. Normal Traffic (typical workstation: low bandwidth, moderate connections, few ports)
        normal_data = pd.DataFrame({
            'bandwidth_usage_mbps': np.random.uniform(0.01, 2.0, 500),
            'concurrent_connections': np.random.randint(10, 150, 500),
            'distinct_dest_ports': np.random.randint(1, 15, 500),
            'failed_auth_attempts': np.random.randint(0, 2, 500),
            'label': 'Normal'
        })
        
        # 2. DDoS Attack (bandwidth spike + many connections — realistic for localhost flood)
        ddos_data = pd.DataFrame({
            'bandwidth_usage_mbps': np.random.uniform(3.0, 100.0, 150),
            'concurrent_connections': np.random.randint(200, 5000, 150),
            'distinct_dest_ports': np.random.randint(1, 10, 150),
            'failed_auth_attempts': np.random.randint(0, 5, 150),
            'label': 'DDoS Attempt'
        })
        
        # 3. Port Scan (low bandwidth, few connections but many distinct ports touched)
        port_scan_data = pd.DataFrame({
            'bandwidth_usage_mbps': np.random.uniform(0.01, 1.0, 150),
            'concurrent_connections': np.random.randint(5, 100, 150),
            'distinct_dest_ports': np.random.randint(20, 500, 150),
            'failed_auth_attempts': np.random.randint(0, 2, 150),
            'label': 'Port Scan'
        })
        
        # 4. Brute Force (high failed auths, few connections, single port)
        brute_force = pd.DataFrame({
            'bandwidth_usage_mbps': np.random.uniform(0.01, 0.5, 150),
            'concurrent_connections': np.random.randint(5, 50, 150),
            'distinct_dest_ports': np.random.randint(1, 3, 150),
            'failed_auth_attempts': np.random.randint(10, 500, 150),
            'label': 'Brute Force'
        })
        
        df = pd.concat([normal_data, ddos_data, port_scan_data, brute_force], ignore_index=True)
        return df
        
    def train(self):
        df = self.generate_synthetic_data()
        X = df.drop('label', axis=1)
        y = df['label']
        
        print(f"[ML Engine] Training Random Forest on {len(df)} simulated network events...")
        self.model.fit(X, y)
        self.is_trained = True
        print("[ML Engine] Model training complete. Ready for real-time inference.")
        
    def predict(self, bandwidth_usage_mbps, concurrent_connections, distinct_dest_ports, failed_auth_attempts):
        if not self.is_trained:
            raise Exception("Model is not trained yet!")
            
        features = pd.DataFrame([{
            'bandwidth_usage_mbps': bandwidth_usage_mbps,
            'concurrent_connections': concurrent_connections,
            'distinct_dest_ports': distinct_dest_ports,
            'failed_auth_attempts': failed_auth_attempts
        }])
        
        prediction = self.model.predict(features)[0]
        # Also return probabilities to determine severity
        probas = self.model.predict_proba(features)[0]
        confidence = max(probas) * 100
        
        return {
            "threat_type": prediction,
            "confidence": round(confidence, 2),
            "is_anomaly": prediction != "Normal"
        }

# Singleton instance for the backend to use
ml_model = IntrusionDetectionModel()
