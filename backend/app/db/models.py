from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    groups = relationship("Group", back_populates="owner")
    bills = relationship("PastBill", back_populates="owner")

class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"))
    default_split_profile = Column(String, default="equal") # e.g., "equal", "individual"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="groups")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")

class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(String, primary_key=True, default=generate_uuid)
    group_id = Column(String, ForeignKey("groups.id"))
    name = Column(String, nullable=False)
    
    group = relationship("Group", back_populates="members")

class PastBill(Base):
    __tablename__ = "past_bills"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"))
    total_amount = Column(Float, nullable=False)
    currency_symbol = Column(String, default="₹")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="bills")
    items = relationship("PastBillItem", back_populates="bill", cascade="all, delete-orphan")

class PastBillItem(Base):
    __tablename__ = "past_bill_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    bill_id = Column(String, ForeignKey("past_bills.id"))
    person_name = Column(String, nullable=False)
    items_total = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    service_charge = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    category = Column(String) # For analytics

    bill = relationship("PastBill", back_populates="items")
