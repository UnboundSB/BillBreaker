from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.bill import Bill, SplitRequest, SplitResult
from app.services.vision import extract_bill_from_image
from app.calculators.split import calculate_split

router = APIRouter()

@router.post("/parse", response_model=Bill)
async def parse_bill(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await image.read()
        bill = extract_bill_from_image(contents, image.content_type)
        return bill
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during bill parsing")

@router.post("/calculate", response_model=SplitResult)
def calculate(request: SplitRequest):
    try:
        result = calculate_split(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
