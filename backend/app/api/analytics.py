from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.db.database import get_db
from app.db.models import User, PastBill, PastBillItem
from app.schemas.analytics import PastBillSchema, PastBillOut, AnalyticsOut
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/bills", response_model=PastBillOut)
def save_bill(bill_in: PastBillSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_bill = PastBill(
        owner_id=current_user.id,
        total_amount=bill_in.total_amount,
        currency_symbol=bill_in.currency_symbol
    )
    db.add(db_bill)
    db.flush()

    for item in bill_in.items:
        db_item = PastBillItem(
            bill_id=db_bill.id,
            person_name=item.person_name,
            items_total=item.items_total,
            tax=item.tax,
            service_charge=item.service_charge,
            discount=item.discount,
            total=item.total,
            category=item.category
        )
        db.add(db_item)
        
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.get("/bills", response_model=List[PastBillOut])
def get_bills(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bills = db.query(PastBill).filter(PastBill.owner_id == current_user.id).order_by(PastBill.created_at.desc()).all()
    return bills

@router.get("/dashboard", response_model=AnalyticsOut)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Very basic analytics
    bills = db.query(PastBill).filter(PastBill.owner_id == current_user.id).all()
    total_spent = sum(b.total_amount for b in bills)
    
    # By person
    from collections import defaultdict
    person_spend = defaultdict(float)
    cat_spend = defaultdict(float)
    
    for bill in bills:
        for item in bill.items:
            person_spend[item.person_name] += item.total
            if item.category:
                cat_spend[item.category] += item.total
                
    by_category = [{"category": k, "total": v} for k, v in cat_spend.items()]
    by_person = [{"person_name": k, "total": v} for k, v in person_spend.items()]
    
    return {
        "total_spent": total_spent,
        "by_category": by_category,
        "by_person": by_person
    }
