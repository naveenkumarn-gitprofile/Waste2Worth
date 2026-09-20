import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

# Define paths relative to this file
SERVICE_DIR = Path(__file__).resolve().parent
MODEL_DIR = SERVICE_DIR / 'ml_models'

MODEL_PATH = MODEL_DIR / 'nutriwaste_xgb_model.pkl'
ENCODER_PATH = MODEL_DIR / 'label_encoder.pkl'
SCALER_PATH = MODEL_DIR / 'feature_scaler.pkl'

# Define the exact feature order expected by the model
FEATURE_ORDER = [
    'Moisture_Pct',
    'Ash_Pct', 
    'Protein_Pct',
    'Fat_Pct',
    'Crude_Fiber_Pct',
    'Carbohydrate_Pct',
    'Total_Phenolics_mgGAE_g',
    'Total_Flavonoids_mgQE_g',
    'DPPH_Inhibition_Pct'
]


class NutriWastePredictor:

  def __init__(self):
    # Load model and artifacts into memory on initialization
    self.model = joblib.load(MODEL_PATH)
    self.label_encoder = joblib.load(ENCODER_PATH)
    self.scaler = joblib.load(SCALER_PATH)

  def predict(
      self, sample_data: dict, high_threshold: float = 80.0, low_cutoff: float = 10.0
  ) -> dict:
    """Accepts raw input dictionary from API, runs XGBoost inference, and applies threshold rules."""
    
    # 1. Extract features in the exact order expected by the model
    features = np.array([[
        sample_data.get('moisture', 0.0),
        sample_data.get('ash', 0.0),
        sample_data.get('protein', 0.0),
        sample_data.get('fat', 0.0),
        sample_data.get('crude_fiber', 0.0),
        sample_data.get('carbohydrate', 0.0),
        sample_data.get('total_phenolics', 0.0),
        sample_data.get('total_flavonoids', 0.0),
        sample_data.get('dpph', 0.0)
    ]])
    
    # 2. Apply the same scaling used during training (with feature names to avoid warning)
    features_df = pd.DataFrame(features, columns=FEATURE_ORDER)
    features_scaled = self.scaler.transform(features_df)
    
    # 3. Get prediction probabilities from the model
    probabilities = self.model.predict_proba(features_scaled)[0]
    
    # 4. Sort indices by probability (descending)
    sorted_indices = np.argsort(probabilities)[::-1]

    top_confidence = round(float(probabilities[sorted_indices[0]]) * 100, 2)
    recommendations = []

    # 5. Apply conditional threshold logic
    if top_confidence >= high_threshold:
      # Return Top 3 recommendations
      rule_applied = 'High Confidence Top-3 Filter (>= 80%)'
      for rank, idx in enumerate(sorted_indices[:3], start=1):
        recommendations.append({
            'rank': rank,
            'product': str(self.label_encoder.classes_[idx]),
            'confidence_pct': round(float(probabilities[idx]) * 100, 2),
        })
    else:
      # Return candidate recommendations >= low_cutoff threshold
      rule_applied = f'Low Confidence Cutoff Filter (>= {low_cutoff}%)'
      rank = 1
      for idx in sorted_indices:
        conf = round(float(probabilities[idx]) * 100, 2)
        if conf >= low_cutoff:
          recommendations.append({
              'rank': rank,
              'product': str(self.label_encoder.classes_[idx]),
              'confidence_pct': conf,
          })
          rank += 1

    return {
        'top_confidence_pct': top_confidence,
        'rule_applied': rule_applied,
        'recommendations': recommendations,
    }


# Global instance for app reuse
predictor_service = NutriWastePredictor()


def predict_and_recommend(input_data: dict) -> dict:
    """
    Wrapper function for backward compatibility with existing API code.
    Calls the NutriWastePredictor and formats the output.
    """
    # Extract the actual ML parameters from input_data
    # The input should contain the 9 parameters for the new model
    ml_input = {
        'moisture': input_data.get('moisture', 0.0),
        'ash': input_data.get('ash', 0.0),
        'protein': input_data.get('protein', 0.0),
        'fat': input_data.get('fat', 0.0),
        'crude_fiber': input_data.get('crude_fiber', 0.0),
        'carbohydrate': input_data.get('carbohydrate', 0.0),
        'total_phenolics': input_data.get('total_phenolics', 0.0),
        'total_flavonoids': input_data.get('total_flavonoids', 0.0),
        'dpph': input_data.get('dpph', 0.0),
    }
    
    # Call the predictor
    result = predictor_service.predict(ml_input)
    
    return result