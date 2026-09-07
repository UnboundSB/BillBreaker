from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal

# Models representing the extracted bill
class BillItem(BaseModel):
    id: str
    name: str
    quantity: int = Field(ge=1, default=1)
    unit_price: Decimal = Field(ge=0)
    item_total: Decimal = Field(ge=0)

class Bill(BaseModel):
    items: List[BillItem]
    subtotal: Decimal = Field(ge=0)
    tax: Decimal = Field(ge=0, default=Decimal('0.00'))
    service_charge: Decimal = Field(ge=0, default=Decimal('0.00'))
    discount: Decimal = Field(ge=0, default=Decimal('0.00'))
    printed_total: Decimal = Field(ge=0)

# Models for the splitting workflow
class Person(BaseModel):
    id: str
    name: str

class ItemAssignment(BaseModel):
    item_id: str
    person_ids: List[str]  # List of person IDs sharing this item.

class SplitRequest(BaseModel):
    bill: Bill
    people: List[Person]
    assignments: List[ItemAssignment]

# Models for the final calculation result
class PersonBreakdown(BaseModel):
    person_id: str
    name: str
    items_total: Decimal
    tax: Decimal
    service_charge: Decimal
    discount: Decimal
    total: Decimal

class SplitResult(BaseModel):
    calculated_total: Decimal
    printed_total: Decimal
    mismatch_amount: Decimal
    people_breakdowns: List[PersonBreakdown]
