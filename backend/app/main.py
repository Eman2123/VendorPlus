"""
VendorPulse — FastAPI entrypoint (Day 2 skeleton).

Rule-based MVP only — no ML, no microservices. See docs/apicontract.md
for the exact request/response shapes each router must implement.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import vendors, calls, dashboard

app = FastAPI(
    title="VendorPulse API",
    description="Autonomous voice check-ins for vendor risk detection.",
    version="0.1.0",
)

# Allow the Next.js dev server to call this API during local dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
