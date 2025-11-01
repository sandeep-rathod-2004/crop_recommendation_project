from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from db import users_collection, predictions_collection
from auth import hash_password, verify_password, create_access_token, decode_token
import joblib
import numpy as np
from datetime import datetime
from pydantic import BaseModel
from fastapi.openapi.utils import get_openapi

app = FastAPI(title="Crop Recommendation API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
model = joblib.load("model/crop_model.pkl")

# --------------------------- MODELS ---------------------------
class User(BaseModel):
    email: str
    password: str

class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# --------------------------- AUTH HELPERS ---------------------------
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["email"]

def require_admin(user_email: str = Depends(get_current_user)):
    user = users_collection.find_one({"email": user_email})
    if not user or not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Access denied")
    return user


# --------------------------- REGISTER ---------------------------
@app.post("/register")
def register_user(user: User):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    user_data = {
        "email": user.email,
        "password": hash_password(user.password),
        "is_admin": user.email == "admin@gmail.com"
    }
    users_collection.insert_one(user_data)
    return {"message": "User registered successfully"}


# --------------------------- LOGIN ---------------------------
@app.post("/login")
def login_user(user: User):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"email": db_user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "is_admin": db_user.get("is_admin", False)
    }


# --------------------------- FORGOT / RESET PASSWORD ---------------------------
@app.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user = users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_access_token({"email": req.email})
    users_collection.update_one(
        {"email": req.email},
        {"$set": {"reset_token": token, "reset_requested_at": datetime.utcnow()}}
    )
    return {"message": "Password reset link generated", "reset_token": token}

@app.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    payload = decode_token(req.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    email = payload.get("email")
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    users_collection.update_one(
        {"email": email},
        {"$set": {"password": hash_password(req.new_password)}, "$unset": {"reset_token": ""}}
    )
    return {"message": "Password reset successful, please login again"}


# --------------------------- PREDICT ---------------------------
@app.post("/predict")
def predict_crop(data: CropInput, user_email: str = Depends(get_current_user)):
    try:
        features = np.array([[data.N, data.P, data.K, data.temperature,
                              data.humidity, data.ph, data.rainfall]])
        prediction = model.predict(features)[0]
        doc = {
            **data.dict(),
            "recommended_crop": prediction,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "user_email": user_email
        }
        predictions_collection.insert_one(doc)
        return {"recommended_crop": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------- HISTORY ---------------------------
@app.get("/history")
def get_history(user_email: str = Depends(get_current_user)):
    records = list(predictions_collection.find({"user_email": user_email}, {"_id": 0}))
    return {"data": records}


# --------------------------- ADMIN ROUTES ---------------------------
@app.get("/admin/users")
def admin_users(admin=Depends(require_admin)):
    users = list(users_collection.find({}, {"_id": 0, "password": 0}))
    return {"users": users}

@app.get("/admin/stats")
def admin_stats(admin=Depends(require_admin)):
    total_users = users_collection.count_documents({})
    total_predictions = predictions_collection.count_documents({})
    return {"total_users": total_users, "total_predictions": total_predictions}


# --------------------------- SWAGGER SECURITY ---------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description="API for crop prediction and user authentication",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
