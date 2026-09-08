import os
import uuid
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types
from app.schemas.bill import Bill, BillItem
from app.core.config import settings
from decimal import Decimal

class GeminiBillItem(BaseModel):
    name: str
    quantity: int
    unit_price: float
    item_total: float
    confidence: float

class GeminiBill(BaseModel):
    items: List[GeminiBillItem]
    subtotal: float
    tax: float
    service_charge: float
    discount: float
    printed_total: float
    currency_symbol: str
    confidence: float

def extract_bill_from_image(image_bytes: bytes, mime_type: str) -> Bill:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    
    client = genai.Client(api_key=api_key)
    model_name = settings.GEMINI_MODEL
    
    prompt = (
        "Extract the structured information from this bill or receipt. "
        "Include all items, quantities, and prices. Extract the subtotal, tax, service charge, discount, and printed total. "
        "Extract the currency symbol used on the bill (e.g. $, €, £). If none is found, default to $. "
        "For EVERY field (each item and the overall bill), provide a 'confidence' score between 0.0 and 1.0 "
        "indicating how confident you are in your extraction. 1.0 means perfectly confident, lower scores indicate ambiguity (e.g., blurry text, handwriting)."
    )

    response = client.models.generate_content(
        model=model_name,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeminiBill,
            temperature=0.0,
        ),
    )
    
    if not response.parsed:
        raise ValueError("Failed to parse the bill image into structured format.")
    
    gemini_bill = response.parsed
    
    # Map to domain Bill model
    bill_items = []
    for item in gemini_bill.items:
        bill_items.append(BillItem(
            id=str(uuid.uuid4()),
            name=item.name,
            quantity=item.quantity,
            unit_price=Decimal(str(item.unit_price)),
            item_total=Decimal(str(item.item_total)),
            confidence=item.confidence
        ))
        
    return Bill(
        items=bill_items,
        subtotal=Decimal(str(gemini_bill.subtotal)),
        tax=Decimal(str(gemini_bill.tax)),
        service_charge=Decimal(str(gemini_bill.service_charge)),
        discount=Decimal(str(gemini_bill.discount)),
        printed_total=Decimal(str(gemini_bill.printed_total)),
        currency_symbol=gemini_bill.currency_symbol,
        confidence=gemini_bill.confidence
    )
