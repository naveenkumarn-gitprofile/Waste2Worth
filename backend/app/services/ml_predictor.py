"""
Mock ML Prediction Module - PLACEHOLDER for future trained model

This module contains the predict_and_recommend function which currently returns
a fixed sample composition (banana peel flour) regardless of input. This function
is designed to be easily replaceable with a real trained ML model later.

To integrate a real model:
1. Load your trained model (.pkl, .h5, etc.) in this module
2. Replace the body of predict_and_recommend() with actual model inference
3. Keep the function signature and return value structure unchanged
"""

def predict_and_recommend(sample_input: dict) -> dict:
    """
    PLACEHOLDER for future trained ML model.
    
    Currently returns a fixed sample composition (banana peel flour)
    regardless of input, plus rule-based product recommendations.
    
    Args:
        sample_input: Dictionary containing sample data (name, source_type, etc.)
                      In future versions, this may include image data or raw features
    
    Returns:
        Dictionary with:
        - composition: dict of nutrient values with units
        - recommendations: list of product suggestions with rationales
    """
    
    # Fixed sample composition (banana peel flour example)
    composition = {
        "protein_g_per_100g": 11.81,
        "fat_g_per_100g": 6.70,
        "fibre_g_per_100g": 11.50,
        "carbohydrate_g_per_100g": 66.05,
        "ash_g_per_100g": 6.79,
        "moisture_g_per_100g": 8.65,
        "energy_kcal_per_100g": 371.74,
        "source_reference": "Sahoo, A., & Lenka, C. (2024). A Comparative Study on Proximate Composition of Odisha's Local Bantal Variety Banana Peel (Musa paradisiaca) Flour with Cereals Flour for Their Value Addition. Asian Food Science Journal, 23(10), 17–27."
    }
    
    # Rule-based recommendations based on nutrient values
    recommendations = [
        {
            "product": "High-fibre bakery flour blend",
            "rationale": "High fibre content (11.5g/100g) supports use as a partial wheat flour substitute in bread/biscuits for improved digestive health benefits."
        },
        {
            "product": "Nutraceutical fibre supplement",
            "rationale": "Elevated fibre and ash content make it suitable as a functional ingredient in dietary supplements."
        },
        {
            "product": "Energy-dense snack bar filler",
            "rationale": "High carbohydrate (66g/100g) and energy content (371.7 kcal/100g) suit use in energy bars and extruded snacks."
        }
    ]
    
    return {
        "composition": composition,
        "recommendations": recommendations
    }
