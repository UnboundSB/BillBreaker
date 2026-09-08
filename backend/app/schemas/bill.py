from pydantic import BaseModel, Field, constr, StringConstraints
from typing import List
from typing_extensions import Annotated
from decimal import Decimal

# Strict String types to prevent massive inputs
StrictStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
IDStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50, pattern=r'^[\w-]+$')]

# Strict Decimal type to prevent massive numbers (up to 99,999,999.99)
StrictDecimal = Annotated[Decimal, Field(max_digits=10, decimal_places=2, ge=0)]

from enum import Enum

class ItemCategory(str, Enum):
    food = "food"
    drink = "drink"
    alcohol = "alcohol"
    shared = "shared"
    tax = "tax"
    service = "service"
    discount = "discount"

class BillItem(BaseModel):
    id: IDStr
    name: StrictStr
    quantity: int = Field(ge=1, le=10000, default=1)
    unit_price: StrictDecimal
    item_total: StrictDecimal
    category: ItemCategory = Field(default=ItemCategory.food)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)

class Bill(BaseModel):
    items: List[BillItem] = Field(max_length=500)
    subtotal: StrictDecimal
    tax: StrictDecimal = Field(default=Decimal('0.00'))
    service_charge: StrictDecimal = Field(default=Decimal('0.00'))
    discount: StrictDecimal = Field(default=Decimal('0.00'))
    printed_total: StrictDecimal
    currency_symbol: str = Field(default="₹", max_length=5)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)

class Person(BaseModel):
    id: IDStr
    name: StrictStr

class ItemAssignment(BaseModel):
    item_id: IDStr
    person_ids: List[IDStr] = Field(max_length=100)
    person_shares: dict[IDStr, float] = Field(default_factory=dict)

class SplitRequest(BaseModel):
    bill: Bill
    people: List[Person] = Field(max_length=100, min_length=1)
    assignments: List[ItemAssignment] = Field(max_length=500)

class PersonBreakdown(BaseModel):
    person_id: IDStr
    name: StrictStr
    items_total: StrictDecimal
    tax: StrictDecimal
    service_charge: StrictDecimal
    discount: StrictDecimal
    total: StrictDecimal

class SplitResult(BaseModel):
    calculated_total: StrictDecimal
    printed_total: StrictDecimal
    mismatch_amount: Decimal = Field(max_digits=10, decimal_places=2) # Can be negative
    currency_symbol: str = Field(default="₹", max_length=5)
    people_breakdowns: List[PersonBreakdown]
