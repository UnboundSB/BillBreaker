from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict

from app.schemas.bill import SplitRequest, SplitResult, PersonBreakdown, BillItem, Person

def _distribute_amount(amount: Decimal, weights: List[Decimal]) -> List[Decimal]:
    """
    Distribute an amount according to weights deterministically.
    If weights sum to 0, distribute equally.
    Handles penny remainders by giving them to those with the largest fractional part.
    """
    if amount == Decimal('0.00'):
        return [Decimal('0.00') for _ in weights]
    
    total_weight = sum(weights)
    if total_weight == Decimal('0.00'):
        # Distribute equally if no weights
        weights = [Decimal('1.00') for _ in weights]
        total_weight = sum(weights)
        if total_weight == Decimal('0.00'):
            return [Decimal('0.00') for _ in weights]

    # Calculate exact shares and rounded down shares (in cents to avoid precision issues)
    # We use integers (cents) for exact distribution
    amount_cents = int((amount * 100).to_integral_value(rounding=ROUND_HALF_UP))
    
    exact_shares = [(w / total_weight) * amount_cents for w in weights]
    floor_shares = [int(s) for s in exact_shares]
    
    remainder_cents = amount_cents - sum(floor_shares)
    
    # To distribute the remainder, sort by the largest fractional part, then by original index
    fractional_parts = [(exact_shares[i] - floor_shares[i], i) for i in range(len(weights))]
    # Sort descending by fractional part, ascending by index to ensure deterministic behavior
    fractional_parts.sort(key=lambda x: (-x[0], x[1]))
    
    for i in range(int(remainder_cents)):
        idx = fractional_parts[i][1]
        floor_shares[idx] += 1
        
    return [Decimal(s) / Decimal(100) for s in floor_shares]

def calculate_split(request: SplitRequest) -> SplitResult:
    bill = request.bill
    people = request.people
    assignments_dict = {a.item_id: a for a in request.assignments}
    
    # Dictionary to keep track of person totals
    # person_id -> items_total
    person_items_total: Dict[str, Decimal] = {p.id: Decimal('0.00') for p in people}
    
    bill_subtotal = Decimal('0.00')
    
    # 1. Distribute item totals
    for item in bill.items:
        item_total = item.item_total
        bill_subtotal += item_total
        
        assignment = assignments_dict.get(item.id)
        if not assignment or not assignment.person_ids:
            # If an item is unassigned, it shouldn't really happen if UI prevents it, 
            # but if it does, we can either ignore or assign to everyone. Let's ignore for now.
            continue
            
        assigned_person_ids = assignment.person_ids
        
        # Distribute based on shares if provided, else equally
        weights = []
        for pid in assigned_person_ids:
            if assignment.person_shares and pid in assignment.person_shares:
                weights.append(Decimal(str(assignment.person_shares[pid])))
            else:
                weights.append(Decimal('1.00'))
                
        shares = _distribute_amount(item_total, weights)
        
        for pid, share in zip(assigned_person_ids, shares):
            if pid in person_items_total:
                person_items_total[pid] += share

    # People IDs in a deterministic order (as provided in request)
    people_ids = [p.id for p in people]
    
    # 2. Distribute Tax, Service Charge, and Discount based on item totals proportion
    weights = [person_items_total[pid] for pid in people_ids]
    
    tax_shares = _distribute_amount(bill.tax, weights)
    service_shares = _distribute_amount(bill.service_charge, weights)
    discount_shares = _distribute_amount(bill.discount, weights)
    
    # 3. Calculate Final Breakdown
    breakdowns = []
    calculated_total = Decimal('0.00')
    
    for i, p in enumerate(people):
        total = person_items_total[p.id] + tax_shares[i] + service_shares[i] - discount_shares[i]
        calculated_total += total
        
        breakdowns.append(PersonBreakdown(
            person_id=p.id,
            name=p.name,
            items_total=person_items_total[p.id],
            tax=tax_shares[i],
            service_charge=service_shares[i],
            discount=discount_shares[i],
            total=total
        ))
        
    mismatch_amount = bill.printed_total - calculated_total
    
    return SplitResult(
        calculated_total=calculated_total,
        printed_total=bill.printed_total,
        mismatch_amount=mismatch_amount,
        currency_symbol=bill.currency_symbol,
        people_breakdowns=breakdowns
    )
