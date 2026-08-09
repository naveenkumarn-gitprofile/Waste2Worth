# ML Model Integration Guide

This document explains how to integrate a real trained ML model into the NutriWasteAI application to replace the current mock predictor.

## Current Implementation

The application currently uses a mock ML predictor located at:
```
backend/app/services/ml_predictor.py
```

This file contains the `predict_and_recommend()` function that returns fixed sample data (banana peel flour composition) regardless of input. This was designed to be easily replaceable with a real trained model.

## Integration Steps

### 1. Prepare Your Model

Train your ML model to predict nutritional composition from food waste samples. The model should accept sample information and return:
- Nutritional composition (protein, fat, fibre, carbohydrate, ash, moisture, energy)
- Source reference (academic citation)
- Product recommendations based on composition

Supported model formats:
- **Scikit-learn**: `.pkl` or `.joblib` files
- **TensorFlow/Keras**: `.h5` or SavedModel format
- **PyTorch**: `.pt` or `.pth` files
- **ONNX**: `.onnx` files (for cross-platform compatibility)

### 2. Add Model Dependencies

Update `backend/requirements.txt` with your ML framework dependencies:

```txt
# For Scikit-learn models
scikit-learn==1.3.0
joblib==1.3.0

# For TensorFlow models
tensorflow==2.14.0

# For PyTorch models
torch==2.1.0
```

Install the new dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### 3. Store Your Model File

Place your trained model file in the backend directory:
```
backend/
├── models/
│   └── nutriwaste_model.pkl  # Your trained model
├── app/
│   └── services/
│       └── ml_predictor.py    # Modify this file
```

### 4. Modify the Predictor Function

Edit `backend/app/services/ml_predictor.py` to load and use your model:

```python
"""
ML Prediction Module - Real Model Integration

This module contains the predict_and_recommend function which uses
a trained ML model to predict nutritional composition and recommend
value-added products.
"""

import joblib  # or import torch, tensorflow, etc.
import os
from typing import Dict, List

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models/nutriwaste_model.pkl")
model = joblib.load(MODEL_PATH)

def predict_and_recommend(sample_input: dict) -> dict:
    """
    Run ML model inference on sample input.
    
    Args:
        sample_input: Dictionary containing sample data
                      - sample_name: str
                      - source_type: str
                      - Optional: nutrient values, image features, etc.
    
    Returns:
        Dictionary with:
        - composition: dict of nutrient values with units
        - recommendations: list of product suggestions with rationales
    """
    
    # Prepare input features for your model
    # This will depend on your model's expected input format
    features = prepare_features(sample_input)
    
    # Run model inference
    prediction = model.predict(features)
    
    # Extract composition from prediction
    composition = {
        "protein_g_per_100g": float(prediction[0]),
        "fat_g_per_100g": float(prediction[1]),
        "fibre_g_per_100g": float(prediction[2]),
        "carbohydrate_g_per_100g": float(prediction[3]),
        "ash_g_per_100g": float(prediction[4]),
        "moisture_g_per_100g": float(prediction[5]),
        "energy_kcal_per_100g": float(prediction[6]),
        "source_reference": "Your model's source reference or dataset citation"
    }
    
    # Generate recommendations based on composition
    recommendations = generate_recommendations(composition)
    
    return {
        "composition": composition,
        "recommendations": recommendations
    }

def prepare_features(sample_input: dict) -> list:
    """
    Convert sample input to model-ready features.
    
    Implement this based on your model's expected input format.
    This might include:
    - Encoding categorical variables (source_type)
    - Normalizing numerical values
    - Extracting features from images
    - Handling missing values
    """
    # Example implementation
    source_type_mapping = {
        "fruit peel": 0,
        "vegetable residue": 1,
        "whey": 2,
        "oilseed cake": 3,
        "other": 4
    }
    
    features = [
        source_type_mapping.get(sample_input.get("source_type"), 4),
        # Add more features as needed by your model
    ]
    
    return features

def generate_recommendations(composition: dict) -> List[dict]:
    """
    Generate product recommendations based on nutritional composition.
    
    This can be rule-based or use another ML model.
    """
    recommendations = []
    
    # Example rule-based logic
    if composition.get("fibre_g_per_100g", 0) > 10:
        recommendations.append({
            "product": "High-fibre bakery flour blend",
            "rationale": f"High fibre content ({composition['fibre_g_per_100g']}g/100g) supports use as a partial wheat flour substitute."
        })
    
    if composition.get("protein_g_per_100g", 0) > 15:
        recommendations.append({
            "product": "Protein-enriched supplement",
            "rationale": f"High protein content ({composition['protein_g_per_100g']}g/100g) suitable for nutritional supplements."
        })
    
    # Add more recommendation logic as needed
    
    return recommendations
```

### 5. Test the Integration

1. **Restart the backend server**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Test the API endpoint**:
   ```bash
   curl -X POST "http://localhost:8000/analysis/manual" \
   -H "Content-Type: application/json" \
   -d '{
     "sample_name": "Test Sample",
     "source_type": "fruit peel"
   }'
   ```

3. **Verify the response** includes predictions from your model

## Important Considerations

### Function Signature
**Do not change** the function signature or return structure:
```python
def predict_and_recommend(sample_input: dict) -> dict:
    # Must return:
    {
        "composition": {
            "protein_g_per_100g": float,
            "fat_g_per_100g": float,
            "fibre_g_per_100g": float,
            "carbohydrate_g_per_100g": float,
            "ash_g_per_100g": float,
            "moisture_g_per_100g": float,
            "energy_kcal_per_100g": float,
            "source_reference": str
        },
        "recommendations": [
            {
                "product": str,
                "rationale": str
            }
        ]
    }
```

### Error Handling
Add proper error handling for model loading and inference:
```python
def predict_and_recommend(sample_input: dict) -> dict:
    try:
        # Model inference code
        pass
    except Exception as e:
        # Fallback to default values or raise appropriate error
        logger.error(f"Model inference failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Model inference failed")
```

### Performance Considerations
- **Model Loading**: Load the model once at module import, not on every request
- **Caching**: Consider caching predictions for identical inputs
- **Async**: For large models, consider async inference
- **Batch Processing**: If processing multiple samples, implement batch prediction

### Image-Based Analysis
For image-based analysis, you'll need to:
1. Add image preprocessing steps (resize, normalize, etc.)
2. Use a CNN model or similar for image feature extraction
3. Combine image features with metadata for prediction

Example for image-based models:
```python
from PIL import Image
import numpy as np

def preprocess_image(image_path: str) -> np.ndarray:
    """Load and preprocess image for model input."""
    img = Image.open(image_path)
    img = img.resize((224, 224))  # Adjust to your model's input size
    img_array = np.array(img) / 255.0  # Normalize
    return img_array

def predict_and_recommend(sample_input: dict, image_path: str = None) -> dict:
    if image_path:
        image_features = preprocess_image(image_path)
        # Use image features for prediction
    else:
        # Use metadata-only prediction
    pass
```

## Model Versioning

For production use, consider:
1. **Version control** your model files
2. **A/B testing** new models before full deployment
3. **Fallback mechanisms** if model loading fails
4. **Monitoring** model performance in production

## Example: Scikit-learn Integration

```python
import joblib
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models/nutriwaste_model.pkl")
model = joblib.load(MODEL_PATH)

def predict_and_recommend(sample_input: dict) -> dict:
    # Prepare features
    features = np.array([[
        encode_source_type(sample_input.get("source_type")),
        sample_input.get("protein", 0) or 0,
        sample_input.get("fat", 0) or 0,
        # ... other features
    ]])
    
    # Predict
    prediction = model.predict(features)[0]
    
    return {
        "composition": {
            "protein_g_per_100g": float(prediction[0]),
            # ... other nutrients
        },
        "recommendations": generate_recommendations(prediction)
    }
```

## Example: TensorFlow/Keras Integration

```python
import tensorflow as tf
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models/nutriwaste_model.h5")
model = tf.keras.models.load_model(MODEL_PATH)

def predict_and_recommend(sample_input: dict) -> dict:
    # Prepare features
    features = prepare_features(sample_input)
    
    # Predict
    prediction = model.predict(features)[0]
    
    return {
        "composition": {
            "protein_g_per_100g": float(prediction[0]),
            # ... other nutrients
        },
        "recommendations": generate_recommendations(prediction)
    }
```

## Testing Checklist

After integrating your model:

- [ ] Model loads successfully without errors
- [ ] Manual entry analysis returns predictions
- [ ] Image analysis returns predictions (if applicable)
- [ ] Recommendations are generated based on composition
- [ ] Error handling works for invalid inputs
- [ ] Performance is acceptable (< 2 seconds per request)
- [ ] Memory usage is reasonable
- [ ] API endpoints return correct response format

## Troubleshooting

### Model Loading Issues
- **Issue**: Model file not found
- **Solution**: Check the `MODEL_PATH` is correct and file exists

### Prediction Errors
- **Issue**: Shape mismatch in model input
- **Solution**: Verify `prepare_features()` returns correct shape

### Performance Issues
- **Issue**: Predictions are slow
- **Solution**: Consider model optimization or caching

### Import Errors
- **Issue**: Missing ML framework dependencies
- **Solution**: Install required packages in requirements.txt

## Support

For questions about model integration, refer to:
- ML framework documentation (scikit-learn, TensorFlow, PyTorch)
- FastAPI documentation for API integration
- Project README for general application setup

## Next Steps

After successful integration:
1. Update this document with your specific implementation details
2. Add model training scripts to the repository
3. Implement model evaluation metrics
4. Set up model retraining pipeline
5. Add monitoring for model performance in production
