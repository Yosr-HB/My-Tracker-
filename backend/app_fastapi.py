import json

from pathlib import Path
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


app = FastAPI()

class ValueData(BaseModel):
    value: bool

DATA_FILE = Path("saved_value.json")
# Create FastAPI app
app = FastAPI(
    title="Value Tracker API",
    description="",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/save-value")
async def save_value(data: ValueData):
    try:
        with open(DATA_FILE, "w") as f:
            json.dump({"value": data.value}, f, ensure_ascii=False, indent=4)
        return {"message": "Value saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-value")
async def save_value():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/")
async def save_value():
    return {"message": "Hello_world"}
