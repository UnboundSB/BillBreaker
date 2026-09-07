import os
from google import genai
from google.genai import types
from app.schemas.bill import Bill

def extract_bill_from_image(image_bytes: bytes, mime_type: str) -> Bill:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    
    client = genai.Client(api_key=api_key)
    
    # We use a multimodal model
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    
    response = client.models.generate_content(
        model=model_name,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            "Extract the structured information from this bill or receipt. Include all items, quantities, and prices. Extract the subtotal, tax, service charge, discount, and printed total."
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Bill,
            temperature=0.0,
        ),
    )
    
    if not response.parsed:
        raise ValueError("Failed to parse the bill image into structured format.")
    
    return response.parsed
