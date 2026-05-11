import os
import joblib
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class RealTimePredictor:
    def __init__(self, model_path="backend/app/ml_engine/models/rf_model.pkl"):
        self.model_path = model_path
        self.scaler_path = self.model_path.replace('.pkl', '_scaler.pkl')
        self.model = None
        self.scaler = None
        self.class_map = {0: "Normal", 1: "DDoS", 2: "Port Scan"}
        self.load_model()

    def load_model(self):
        """Loads the pre-trained model and scaler."""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            logger.info("ML Model and Scaler loaded successfully.")
        else:
            logger.warning(f"Model not found at {self.model_path}. Please run model_trainer.py first.")

    def predict(self, feature_dicts):
        """
        Takes a list of feature dictionaries (from FeatureExtractor)
        and returns predictions for each flow.
        """
        if not self.model or not self.scaler:
            return [{"error": "Model not loaded"}]

        if not feature_dicts:
            return []

        # Convert list of dicts to DataFrame for prediction
        # Exclude 'flow_id' and 'timestamp' as they are not ML features
        features_df = pd.DataFrame(feature_dicts)
        ml_features = features_df[['duration', 'total_packets', 'total_bytes', 'packets_per_sec', 'bytes_per_sec']]

        # Normalize live data using the saved scaler
        scaled_features = self.scaler.transform(ml_features)

        # Predict
        predictions = self.model.predict(scaled_features)
        probabilities = self.model.predict_proba(scaled_features)

        results = []
        for i, pred in enumerate(predictions):
            confidence = max(probabilities[i]) * 100
            threat_type = self.class_map.get(pred, "Unknown")
            
            result = {
                "flow_id": feature_dicts[i]["flow_id"],
                "timestamp": feature_dicts[i]["timestamp"],
                "prediction": threat_type,
                "confidence": round(confidence, 2),
                "is_threat": threat_type != "Normal"
            }
            results.append(result)

        return results
