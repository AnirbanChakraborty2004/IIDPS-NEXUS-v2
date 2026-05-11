import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import logging

logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, model_save_path="backend/app/ml_engine/models/rf_model.pkl"):
        self.model_save_path = model_save_path
        self.scaler_save_path = self.model_save_path.replace('.pkl', '_scaler.pkl')
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.model_save_path), exist_ok=True)

    def generate_synthetic_data(self, samples=10000):
        """
        Generates a synthetic dataset mimicking CICIDS2017 for immediate POC testing.
        Features: duration, total_packets, total_bytes, packets_per_sec, bytes_per_sec
        """
        logger.info(f"Generating {samples} synthetic samples for training...")
        np.random.seed(42)
        
        # 0: Normal, 1: DDoS, 2: Port Scan
        labels = np.random.choice([0, 1, 2], size=samples, p=[0.7, 0.2, 0.1])
        
        data = []
        for label in labels:
            if label == 0: # Normal (low traffic)
                dur = np.random.uniform(0.1, 5.0)
                pkts = np.random.randint(5, 50)
                bytes_ = pkts * np.random.randint(64, 1500)
            elif label == 1: # DDoS (high packet rate)
                dur = np.random.uniform(0.1, 1.0)
                pkts = np.random.randint(1000, 5000)
                bytes_ = pkts * np.random.randint(64, 128)
            else: # Port Scan (low bytes, high packet count over longer time)
                dur = np.random.uniform(1.0, 10.0)
                pkts = np.random.randint(100, 500)
                bytes_ = pkts * 64

            pps = pkts / dur
            bps = bytes_ / dur
            data.append([dur, pkts, bytes_, pps, bps])

        df = pd.DataFrame(data, columns=['duration', 'total_packets', 'total_bytes', 'packets_per_sec', 'bytes_per_sec'])
        return df, labels

    def train_and_save(self, df=None, labels=None):
        """Trains the Random Forest model and saves it to disk."""
        if df is None or labels is None:
            df, labels = self.generate_synthetic_data()

        logger.info("Splitting dataset...")
        X_train, X_test, y_train, y_test = train_test_split(df, labels, test_size=0.2, random_state=42)

        logger.info("Normalizing features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        logger.info("Training Random Forest Classifier...")
        self.model.fit(X_train_scaled, y_train)

        logger.info("Evaluating model...")
        predictions = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, predictions)
        
        logger.info(f"Model Accuracy: {accuracy * 100:.2f}%")
        logger.info(f"Classification Report:\n{classification_report(y_test, predictions)}")

        if accuracy > 0.85:
            logger.info(f"Saving model to {self.model_save_path}")
            joblib.dump(self.model, self.model_save_path)
            joblib.dump(self.scaler, self.scaler_save_path)
            return True
        else:
            logger.error("Model failed to reach 85% accuracy threshold.")
            return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    trainer = ModelTrainer(model_save_path=r"C:\Users\anirb\OneDrive\Desktop\IIDPS-NEXUS\backend\app\ml_engine\models\rf_model.pkl")
    trainer.train_and_save()
