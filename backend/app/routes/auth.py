
from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter()

# DEMO ONLY: Never use a fixed OTP in production.
DEMO_OTP = "123456"


class MobileRequest(BaseModel):
    mobile: str


class OTPRequest(BaseModel):
    mobile: str
    otp: str


@router.post("/send-otp")
def send_otp(data: MobileRequest):

    if not re.fullmatch(r"[6-9][0-9]{9}", data.mobile):
        return {
            "success": False,
            "message": "Invalid mobile number"
        }

    return {
        "success": True,
        "message": "Demo OTP generated",
        "demo_otp": DEMO_OTP
    }


@router.post("/verify-otp")
def verify_otp(data: OTPRequest):

    if data.otp != DEMO_OTP:
        return {
            "success": False,
            "message": "Incorrect OTP"
        }

    return {
        "success": True,
        "message": "Demo verification successful",
        "patient": {
            "id": 1,
            "name": "Lakshmi Prasanna K"
        }
    }
