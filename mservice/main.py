"""
FastAPI Microservice for Agricultural Machine Learning
Endpoints:
- POST /predict/crop: Recommends crops based on soil and climate inputs
- POST /predict/yield: Predicts expected yield range based on crop, area, weather
- GET /health: Service health status
"""

import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np

app = FastAPI(
    title="Agricultural AI ML Microservice",
    description="Precision crop recommendation and yield prediction API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
crop_model_path = os.path.join(MODEL_DIR, "crop_model.joblib")
yield_model_path = os.path.join(MODEL_DIR, "yield_model.joblib")
yield_encoder_path = os.path.join(MODEL_DIR, "yield_crop_encoder.joblib")

crop_model = None
yield_model = None
yield_encoder = None

def load_or_train_models():
    global crop_model, yield_model, yield_encoder
    try:
        import joblib
        if not (os.path.exists(crop_model_path) and os.path.exists(yield_model_path)):
            from train_model import train_and_save
            train_and_save()
        crop_model = joblib.load(crop_model_path)
        yield_model = joblib.load(yield_model_path)
        yield_encoder = joblib.load(yield_encoder_path)
        print("ML Models loaded successfully.")
    except Exception as e:
        print(f"Warning: Model loading failed: {e}. Falling back to internal heuristic engine.")

@app.on_event("startup")
def startup_event():
    load_or_train_models()

# Request schemas
class CropPredictRequest(BaseModel):
    N: float = Field(..., description="Nitrogen content in soil (mg/kg or ratio)", example=90.0)
    P: float = Field(..., description="Phosphorus content in soil", example=42.0)
    K: float = Field(..., description="Potassium content in soil", example=43.0)
    temperature: float = Field(..., description="Average temperature in Celsius", example=20.8)
    humidity: float = Field(..., description="Relative humidity in percentage", example=82.0)
    ph: float = Field(..., description="Soil pH value (1-14)", example=6.5)
    rainfall: float = Field(..., description="Rainfall in mm", example=202.9)

class CropPredictResponse(BaseModel):
    success: bool
    top_crop: str
    confidence: float
    recommendations: List[dict]
    rationale: str

class YieldPredictRequest(BaseModel):
    crop: str = Field(..., example="wheat")
    area: float = Field(..., description="Farm area in hectares", example=2.5)
    rainfall: Optional[float] = Field(80.0, description="Rainfall in mm")
    temperature: Optional[float] = Field(22.0, description="Temperature in Celsius")
    soil_type: Optional[str] = Field("loamy", description="Soil classification")
    season: Optional[str] = Field("Rabi", description="Cropping season")

class YieldPredictResponse(BaseModel):
    success: bool
    crop: str
    area_ha: float
    estimated_yield_per_ha: float
    total_estimated_production_tonnes: float
    yield_range_min_tonnes: float
    yield_range_max_tonnes: float
    unit: str
    advisory: str

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "agricultural-ml-fastapi",
        "models_loaded": crop_model is not None and yield_model is not None
    }

@app.post("/predict/crop", response_model=CropPredictResponse)
def predict_crop(req: CropPredictRequest):
    global crop_model
    features = np.array([[req.N, req.P, req.K, req.temperature, req.humidity, req.ph, req.rainfall]])
    
    if crop_model is not None:
        try:
            probabilities = crop_model.predict_proba(features)[0]
            classes = crop_model.classes_
            top_indices = np.argsort(probabilities)[::-1][:3]
            top_crop = classes[top_indices[0]]
            top_conf = round(float(probabilities[top_indices[0]]), 4)

            recommendations = []
            for idx in top_indices:
                recommendations.append({
                    "crop": classes[idx],
                    "confidence": round(float(probabilities[idx]), 4),
                    "suitable": bool(probabilities[idx] > 0.15)
                })

            rationale = (
                f"Based on soil nutrients (N: {req.N}, P: {req.P}, K: {req.K}, pH: {req.ph}) and "
                f"agro-climatic conditions (Temp: {req.temperature}°C, Rain: {req.rainfall}mm), "
                f"{top_crop.capitalize()} is the best match with {round(top_conf * 100, 1)}% confidence."
            )

            return CropPredictResponse(
                success=True,
                top_crop=top_crop,
                confidence=top_conf,
                recommendations=recommendations,
                rationale=rationale
            )
        except Exception as e:
            print(f"Error during ML inference: {e}")

    # Fallback heuristic calculation if model unavailable
    # Simple nutrient & water matching
    crop_scores = {
        "wheat": (req.N / 120 + req.P / 60 + req.K / 40) / 3,
        "rice": (req.rainfall / 200 + req.humidity / 80 + req.N / 80) / 3,
        "maize": (req.N / 80 + req.P / 50 + req.temperature / 25) / 3,
        "chickpea": (req.P / 65 + req.K / 80 + (8.0 - abs(req.ph - 7.0)) / 8) / 3
    }
    sorted_crops = sorted(crop_scores.items(), key=lambda x: x[1], reverse=True)
    top_c = sorted_crops[0][0]
    return CropPredictResponse(
        success=True,
        top_crop=top_c,
        confidence=0.85,
        recommendations=[{"crop": c[0], "confidence": round(min(0.95, c[1]/1.5), 2), "suitable": True} for c in sorted_crops[:3]],
        rationale=f"Agronomic heuristics recommend {top_c.capitalize()} for current soil and climate profile."
    )

@app.post("/predict/yield", response_model=YieldPredictResponse)
def predict_yield(req: YieldPredictRequest):
    global yield_model, yield_encoder
    crop_lower = req.crop.lower()
    base_yields = {
        "wheat": 3.5, "rice": 4.0, "maize": 4.2, "cotton": 2.2, "chickpea": 1.5,
        "mungbean": 1.2, "sugarcane": 70.0, "mustard": 1.8, "soybean": 2.5, "potato": 22.0
    }
    base_y = base_yields.get(crop_lower, 3.0)

    if yield_model is not None and yield_encoder is not None and crop_lower in yield_encoder.classes_:
        try:
            encoded_crop = yield_encoder.transform([crop_lower])[0]
            X = np.array([[encoded_crop, req.area, req.rainfall or 80.0, req.temperature or 22.0]])
            pred_y_per_ha = float(yield_model.predict(X)[0])
        except Exception:
            pred_y_per_ha = base_y
    else:
        # Heuristic adjustment
        rain_factor = min(1.2, max(0.7, (req.rainfall or 80.0) / 100.0))
        pred_y_per_ha = base_y * rain_factor

    pred_y_per_ha = max(0.5, round(pred_y_per_ha, 2))
    total_est = round(pred_y_per_ha * req.area, 2)
    min_tonnes = round(total_est * 0.85, 2)
    max_tonnes = round(total_est * 1.15, 2)

    advisory = (
        f"Estimated yield for {req.crop.capitalize()} on {req.area} ha is {total_est} tonnes "
        f"({pred_y_per_ha} tonnes/ha). Expected harvest range: {min_tonnes} - {max_tonnes} tonnes "
        f"depending on pest control and irrigation timeliness."
    )

    return YieldPredictResponse(
        success=True,
        crop=req.crop,
        area_ha=req.area,
        estimated_yield_per_ha=pred_y_per_ha,
        total_estimated_production_tonnes=total_est,
        yield_range_min_tonnes=min_tonnes,
        yield_range_max_tonnes=max_tonnes,
        unit="metric tonnes",
        advisory=advisory
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
