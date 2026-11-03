"""
MongoDB direct client and utility functions for Lost & Found platform.
"""
import os
import logging
from pathlib import Path
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

logger = logging.getLogger(__name__)

_mongo_client = None

def get_mongo_client():
    """Return a singleton MongoClient instance."""
    global _mongo_client
    if _mongo_client is None:
        uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
        _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=4000)
    return _mongo_client

def get_db():
    """Return the default MongoDB database instance."""
    client = get_mongo_client()
    db_name = os.environ.get("MONGODB_DB_NAME", "lostandfound")
    return client[db_name]

def verify_mongo_connection():
    """Verify that MongoDB is accessible and responsive."""
    try:
        client = get_mongo_client()
        info = client.admin.command('ping')
        return True, "MongoDB connection established successfully."
    except (ConnectionFailure, ServerSelectionTimeoutError) as err:
        return False, f"MongoDB connection failed: {err}"
    except Exception as err:
        return False, f"Unexpected error connecting to MongoDB: {err}"
