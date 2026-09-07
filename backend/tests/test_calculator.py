import pytest
from decimal import Decimal
from app.schemas.bill import Bill, BillItem, Person, ItemAssignment, SplitRequest
from app.calculators.split import calculate_split

def test_calculate_split_equal():
    bill = Bill(
        items=[
            BillItem(id="1", name="Pizza", quantity=1, unit_price=Decimal("20.00"), item_total=Decimal("20.00"))
        ],
        subtotal=Decimal("20.00"),
        tax=Decimal("2.00"),
        service_charge=Decimal("0.00"),
        discount=Decimal("0.00"),
        printed_total=Decimal("22.00")
    )
    people = [Person(id="p1", name="Alice"), Person(id="p2", name="Bob")]
    assignments = [ItemAssignment(item_id="1", person_ids=["p1", "p2"])]
    
    req = SplitRequest(bill=bill, people=people, assignments=assignments)
    res = calculate_split(req)
    
    assert res.calculated_total == Decimal("22.00")
    assert res.mismatch_amount == Decimal("0.00")
    
    assert len(res.people_breakdowns) == 2
    for b in res.people_breakdowns:
        assert b.items_total == Decimal("10.00")
        assert b.tax == Decimal("1.00")
        assert b.total == Decimal("11.00")

def test_calculate_split_unequal_cents():
    bill = Bill(
        items=[
            BillItem(id="1", name="Fries", quantity=1, unit_price=Decimal("3.34"), item_total=Decimal("3.34"))
        ],
        subtotal=Decimal("3.34"),
        tax=Decimal("0.00"),
        printed_total=Decimal("3.34")
    )
    people = [Person(id="p1", name="Alice"), Person(id="p2", name="Bob"), Person(id="p3", name="Charlie")]
    assignments = [ItemAssignment(item_id="1", person_ids=["p1", "p2", "p3"])]
    
    req = SplitRequest(bill=bill, people=people, assignments=assignments)
    res = calculate_split(req)
    
    # 3.34 / 3 = 1.11, 1.11, 1.12
    # The remainder is distributed to the first in the list since fractional parts are equal (0.333)
    assert res.calculated_total == Decimal("3.34")
    assert res.people_breakdowns[0].total == Decimal("1.12")
    assert res.people_breakdowns[1].total == Decimal("1.11")
    assert res.people_breakdowns[2].total == Decimal("1.11")

def test_mismatch_printed_total():
    bill = Bill(
        items=[
            BillItem(id="1", name="Burger", quantity=1, unit_price=Decimal("10.00"), item_total=Decimal("10.00"))
        ],
        subtotal=Decimal("10.00"),
        printed_total=Decimal("15.00")  # Intentional mismatch
    )
    people = [Person(id="p1", name="Alice")]
    assignments = [ItemAssignment(item_id="1", person_ids=["p1"])]
    
    req = SplitRequest(bill=bill, people=people, assignments=assignments)
    res = calculate_split(req)
    
    assert res.calculated_total == Decimal("10.00")
    assert res.mismatch_amount == Decimal("5.00")
