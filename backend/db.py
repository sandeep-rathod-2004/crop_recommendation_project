# backend/db.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client["cropDB"]
users_collection = db["users"]
predictions_collection = db["predictions"]
