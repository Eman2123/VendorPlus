"""
VendorPulse — FastAPI entrypoint.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import vendors, calls, dashboard

app = FastAPI(
    title="VendorPulse API",
    description="Autonomous voice check-ins for vendor risk detection.",
    version="0.1.0",
)

# Comma-separated list in .env, e.g.:
# ALLOWED_ORIGINS=http://localhost:3000,https://vendorplus.vercel.app
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router, tags=["vendors"])
app.include_router(calls.router, tags=["calls"])
app.include_router(dashboard.router, tags=["dashboard"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
