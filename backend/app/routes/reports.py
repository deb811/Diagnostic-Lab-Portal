
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from uuid import uuid4
import shutil

router = APIRouter()

# Local storage for demo PDF files
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Temporary sample report information
sample_reports = [
    {
        "order_id": "ORD-71204",
        "patient_id": "PAT-001",
        "patient": "Lakshmi Prasanna K",
        "test": "Haemoglobin",
        "result": "10.2 g/dL",
        "status": "Ready",
        "doctor": "Dr. S. Ramanaiah",
        "pdf_filename": None
    },
    {
        "order_id": "ORD-71219",
        "patient_id": "PAT-001",
        "patient": "Lakshmi Prasanna K",
        "test": "LDL Cholesterol",
        "result": "142 mg/dL",
        "status": "Processing",
        "doctor": "Dr. S. Ramanaiah",
        "pdf_filename": None
    },
    {
        "order_id": "ORD-71233",
        "patient_id": "PAT-001",
        "patient": "Lakshmi Prasanna K",
        "test": "Potassium",
        "result": "6.8 mmol/L",
        "status": "Ready - Critical",
        "doctor": "Dr. S. Ramanaiah",
        "pdf_filename": None
    }
]


@router.get("/reports")
def get_reports():
    return {
        "success": True,
        "total": len(sample_reports),
        "reports": sample_reports
    }


@router.get("/reports/{order_id}")
def get_report(order_id: str):

    for report in sample_reports:
        if report["order_id"] == order_id:
            return {
                "success": True,
                "report": report
            }

    raise HTTPException(
        status_code=404,
        detail="Report not found"
    )


# Upload a PDF for an existing order
@router.post("/reports/{order_id}/upload")
async def upload_report(
    order_id: str,
    file: UploadFile = File(...)
):
    report = next(
        (r for r in sample_reports
         if r["order_id"] == order_id),
        None
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Read and validate PDF file signature
    content = await file.read()

    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file"
        )

    # Maximum file size: 10 MB
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="PDF must be smaller than 10 MB"
        )

    filename = f"{uuid4().hex}.pdf"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as output:
        output.write(content)

    report["pdf_filename"] = filename
    report["status"] = "Ready"

    return {
        "success": True,
        "message": "PDF uploaded successfully",
        "order_id": order_id
    }


# Download an uploaded PDF
@router.get("/reports/{order_id}/download")
def download_report(order_id: str):

    report = next(
        (r for r in sample_reports
         if r["order_id"] == order_id),
        None
    )

    if not report or not report["pdf_filename"]:
        raise HTTPException(
            status_code=404,
            detail="PDF report not available"
        )

    file_path = UPLOAD_DIR / report["pdf_filename"]

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="PDF file not found"
        )

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=f"{order_id}.pdf"
    )
