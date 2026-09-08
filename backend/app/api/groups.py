from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import User, Group, GroupMember
from app.schemas.groups import GroupCreate, GroupOut, GroupMemberCreate, GroupMemberOut
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=GroupOut)
def create_group(group_in: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_group = Group(
        name=group_in.name,
        default_split_profile=group_in.default_split_profile,
        owner_id=current_user.id
    )
    db.add(db_group)
    db.flush() # flush to get db_group.id
    
    for member_name in group_in.members:
        member = GroupMember(group_id=db_group.id, name=member_name)
        db.add(member)
        
    db.commit()
    db.refresh(db_group)
    return db_group

@router.get("/", response_model=List[GroupOut])
def get_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    groups = db.query(Group).filter(Group.owner_id == current_user.id).all()
    return groups

@router.delete("/{group_id}")
def delete_group(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = db.query(Group).filter(Group.id == group_id, Group.owner_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    db.delete(group)
    db.commit()
    return {"ok": True}
