from pydantic import BaseModel
from typing import List
from datetime import datetime

class PastBillItemSchema(BaseModel):
    person_name: str
    items_total: float
    tax: float
    service_charge: float
    discount: float
    total: float
    category: str | None = None

class PastBillSchema(BaseModel):
    total_amount: float
    currency_symbol: str
    items: List[PastBillItemSchema]

class PastBillOut(BaseModel):
    id: str
    owner_id: str
    total_amount: float
    currency_symbol: str
    created_at: datetime
    items: List[PastBillItemSchema]

    class Config:
        from_attributes = True

class CategorySpend(BaseModel):
    category: str
    total: float

class PersonSpend(BaseModel):
    person_name: str
    total: float

class AnalyticsOut(BaseModel):
    total_spent: float
    by_category: List[CategorySpend]
    by_person: List[PersonSpend]
