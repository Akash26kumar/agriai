"""
Agricultural Machine Learning Model Trainer
Trains:
1. Crop Recommendation Model (Random Forest Classifier) using N, P, K, Temperature, Humidity, pH, Rainfall
2. Crop Yield Range Estimator (Gradient Boosting Regressor) using Crop, Soil, Season, Area, Rainfall, Temperature
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# Synthetic dataset generator based on standard ICAR/USDA agronomic parameter bounds
def generate_crop_data():
    crop_profiles = {
        "rice": {"N": (60, 100), "P": (35, 60), "K": (35, 45), "temp": (20, 27), "humidity": (80, 85), "ph": (5.0, 6.5), "rain": (200, 300)},
        "wheat": {"N": (100, 140), "P": (50, 70), "K": (30, 45), "temp": (15, 24), "humidity": (50, 70), "ph": (6.0, 7.5), "rain": (50, 100)},
        "maize": {"N": (60, 100), "P": (40, 60), "K": (15, 25), "temp": (18, 27), "humidity": (55, 75), "ph": (5.5, 7.0), "rain": (60, 110)},
        "chickpea": {"N": (20, 50), "P": (55, 80), "K": (75, 85), "temp": (17, 22), "humidity": (15, 20), "ph": (6.0, 8.0), "rain": (65, 95)},
        "kidneybeans": {"N": (15, 40), "P": (55, 80), "K": (15, 25), "temp": (15, 24), "humidity": (20, 25), "ph": (5.5, 6.0), "rain": (60, 150)},
        "pigeonpeas": {"N": (15, 40), "P": (55, 80), "K": (18, 25), "temp": (27, 38), "humidity": (45, 65), "ph": (5.5, 7.5), "rain": (90, 198)},
        "mothbeans": {"N": (15, 40), "P": (35, 60), "K": (15, 25), "temp": (24, 32), "humidity": (40, 65), "ph": (6.0, 8.5), "rain": (30, 75)},
        "mungbean": {"N": (15, 40), "P": (35, 60), "K": (15, 25), "temp": (27, 30), "humidity": (80, 90), "ph": (6.2, 7.2), "rain": (35, 60)},
        "blackgram": {"N": (35, 60), "P": (55, 80), "K": (15, 25), "temp": (25, 35), "humidity": (60, 70), "ph": (6.5, 7.5), "rain": (60, 75)},
        "lentil": {"N": (15, 40), "P": (55, 80), "K": (15, 25), "temp": (18, 28), "humidity": (60, 70), "ph": (6.0, 7.8), "rain": (35, 55)},
        "pomegranate": {"N": (15, 40), "P": (10, 30), "K": (35, 45), "temp": (18, 25), "humidity": (85, 95), "ph": (5.5, 7.2), "rain": (100, 115)},
        "banana": {"N": (90, 120), "P": (70, 95), "K": (45, 55), "temp": (25, 30), "humidity": (75, 85), "ph": (5.5, 6.5), "rain": (90, 120)},
        "mango": {"N": (15, 40), "P": (15, 35), "K": (25, 35), "temp": (27, 36), "humidity": (45, 55), "ph": (4.5, 7.0), "rain": (90, 105)},
        "grapes": {"N": (15, 40), "P": (120, 145), "K": (195, 205), "temp": (8, 42), "humidity": (80, 85), "ph": (5.5, 6.5), "rain": (65, 75)},
        "watermelon": {"N": (80, 120), "P": (5, 30), "K": (45, 55), "temp": (24, 27), "humidity": (80, 90), "ph": (6.0, 7.0), "rain": (40, 60)},
        "muskmelon": {"N": (80, 120), "P": (5, 30), "K": (45, 55), "temp": (27, 30), "humidity": (90, 95), "ph": (6.0, 6.8), "rain": (20, 30)},
        "apple": {"N": (15, 40), "P": (120, 145), "K": (195, 205), "temp": (21, 24), "humidity": (90, 95), "ph": (5.5, 6.5), "rain": (100, 125)},
        "orange": {"N": (15, 40), "P": (5, 30), "K": (5, 15), "temp": (10, 35), "humidity": (90, 95), "ph": (6.0, 8.0), "rain": (100, 120)},
        "papaya": {"N": (40, 60), "P": (45, 70), "K": (45, 55), "temp": (30, 40), "humidity": (90, 95), "ph": (6.0, 7.0), "rain": (140, 250)},
        "coconut": {"N": (15, 40), "P": (5, 30), "K": (25, 35), "temp": (25, 29), "humidity": (90, 100), "ph": (5.5, 6.5), "rain": (130, 225)},
        "cotton": {"N": (100, 140), "P": (35, 60), "K": (15, 25), "temp": (22, 26), "humidity": (60, 85), "ph": (6.0, 8.0), "rain": (60, 90)},
        "jute": {"N": (60, 90), "P": (35, 60), "K": (35, 45), "temp": (23, 26), "humidity": (70, 90), "ph": (6.0, 7.5), "rain": (150, 200)},
        "coffee": {"N": (80, 120), "P": (15, 40), "K": (25, 35), "temp": (23, 28), "humidity": (50, 70), "ph": (6.0, 7.5), "rain": (115, 200)}
    }

    rows = []
    np.random.seed(42)
    for crop, bounds in crop_profiles.items():
        for _ in range(120): # 120 samples per crop
            n = np.random.uniform(bounds["N"][0], bounds["N"][1])
            p = np.random.uniform(bounds["P"][0], bounds["P"][1])
            k = np.random.uniform(bounds["K"][0], bounds["K"][1])
            temp = np.random.uniform(bounds["temp"][0], bounds["temp"][1])
            hum = np.random.uniform(bounds["humidity"][0], bounds["humidity"][1])
            ph = np.random.uniform(bounds["ph"][0], bounds["ph"][1])
            rain = np.random.uniform(bounds["rain"][0], bounds["rain"][1])
            rows.append([n, p, k, temp, hum, ph, rain, crop])

    return pd.DataFrame(rows, columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "label"])

def generate_yield_data():
    base_yields = {
        "wheat": 3.5, "rice": 4.0, "maize": 4.2, "cotton": 2.2, "chickpea": 1.5,
        "mungbean": 1.2, "sugarcane": 70.0, "mustard": 1.8, "soybean": 2.5, "potato": 22.0
    }
    rows = []
    np.random.seed(42)
    for crop, base_y in base_yields.items():
        for _ in range(100):
            area = np.random.uniform(1.0, 15.0)
            rainfall = np.random.uniform(40, 250)
            temp = np.random.uniform(15, 35)
            # simulate yield per hectare with weather variance
            y_per_ha = base_y * (1 + np.random.normal(0, 0.12))
            if rainfall < 60 and crop in ["rice", "sugarcane"]:
                y_per_ha *= 0.7
            if temp > 35 and crop == "wheat":
                y_per_ha *= 0.75
            rows.append([crop, area, rainfall, temp, max(0.5, y_per_ha)])

    return pd.DataFrame(rows, columns=["crop", "area", "rainfall", "temperature", "yield_tonnes_per_ha"])

def train_and_save():
    print("Training Crop Recommendation Model...")
    df_crop = generate_crop_data()
    X_crop = df_crop[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]]
    y_crop = df_crop["label"]

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_crop, y_crop)
    joblib.dump(clf, os.path.join(MODEL_DIR, "crop_model.joblib"))

    print("Training Yield Estimator...")
    df_yield = generate_yield_data()
    le = LabelEncoder()
    df_yield["crop_encoded"] = le.fit_transform(df_yield["crop"])
    X_yield = df_yield[["crop_encoded", "area", "rainfall", "temperature"]]
    y_yield = df_yield["yield_tonnes_per_ha"]

    reg = GradientBoostingRegressor(n_estimators=80, random_state=42)
    reg.fit(X_yield, y_yield)

    joblib.dump(reg, os.path.join(MODEL_DIR, "yield_model.joblib"))
    joblib.dump(le, os.path.join(MODEL_DIR, "yield_crop_encoder.joblib"))

    print("Models successfully trained and saved!")

if __name__ == "__main__":
    train_and_save()
