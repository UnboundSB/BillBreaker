from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Response
from app.schemas.bill import Bill, SplitRequest, SplitResult
from app.services.vision import extract_bill_from_image
from app.calculators.split import calculate_split
from app.services.pdf import generate_split_pdf
from app.core.config import settings

router = APIRouter()

@router.post("/parse", response_model=Bill)
async def parse_bill(request: Request, image: UploadFile = File(...)):
    # 1. Content type validation
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are supported.")
    
    # 2. Content length validation (pre-flight check if header exists)
    content_length = request.headers.get('content-length')
    if content_length and int(content_length) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    # 3. Read and exact size validation
    contents = await image.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
        
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    try:
        bill = extract_bill_from_image(contents, image.content_type)
        return bill
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    # Unhandled exceptions will be caught by global handler for 500s

@router.post("/calculate", response_model=SplitResult)
def calculate(request: SplitRequest):
    try:
        result = calculate_split(request)
        return result
    except Exception as e:
        # We catch explicit business logic errors here
        raise HTTPException(status_code=400, detail="Error during calculation")

@router.post("/export/pdf")
def export_pdf(result: SplitResult):
    try:
        pdf_bytes = generate_split_pdf(result)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=\"bill_split.pdf\""}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating PDF")
