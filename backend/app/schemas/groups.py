from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GroupMemberBase(BaseModel):
    name: str

class GroupMemberCreate(GroupMemberBase):
    pass

class GroupMemberOut(GroupMemberBase):
    id: str
    group_id: str

    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    name: str
    default_split_profile: Optional[str] = "equal"

class GroupCreate(GroupBase):
    members: List[str] # List of names

class GroupOut(GroupBase):
    id: str
    owner_id: str
    created_at: datetime
    members: List[GroupMemberOut] = []

    class Config:
        from_attributes = True
