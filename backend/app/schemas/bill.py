from pydantic import BaseModel, Field, constr, StringConstraints
from typing import List
from typing_extensions import Annotated
from decimal import Decimal

# Strict String types to prevent massive inputs
StrictStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
IDStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50, pattern=r'^[\w-]+$')]

# Strict Decimal type to prevent massive numbers (up to 99,999,999.99)
StrictDecimal = Annotated[Decimal, Field(max_digits=10, decimal_places=2, ge=0)]

class BillItem(BaseModel):
    id: IDStr
    name: StrictStr
    quantity: int = Field(ge=1, le=10000, default=1)
    unit_price: StrictDecimal
    item_total: StrictDecimal

class Bill(BaseModel):
    items: List[BillItem] = Field(max_length=500)
    subtotal: StrictDecimal
    tax: StrictDecimal = Field(default=Decimal('0.00'))
    service_charge: StrictDecimal = Field(default=Decimal('0.00'))
    discount: StrictDecimal = Field(default=Decimal('0.00'))
    printed_total: StrictDecimal

class Person(BaseModel):
    id: IDStr
    name: StrictStr

class ItemAssignment(BaseModel):
    item_id: IDStr
    person_ids: List[IDStr] = Field(max_length=100)

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
    people_breakdowns: List[PersonBreakdown]
