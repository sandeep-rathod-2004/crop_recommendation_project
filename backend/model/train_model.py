# backend/model/train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# ✅ Working dataset URL
data = pd.read_csv("D:/crop_recommendation_project/backend/model/Crop_recommendation.csv")

# Split features and labels
X = data.drop("label", axis=1)
y = data["label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

print("✅ Model trained with accuracy:", model.score(X_test, y_test))

# Save model in the same folder
joblib.dump(model, "crop_model.pkl")
print("💾 Model saved as crop_model.pkl")
