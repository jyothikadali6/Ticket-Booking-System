from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List


# =============================
# USER
# =============================

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


# =============================
# EVENT
# =============================

class EventCreate(BaseModel):
    name: str
    total_seats: int


class EventResponse(BaseModel):
    id: int
    name: str
    total_seats: int
    available_seats: int

    model_config = ConfigDict(from_attributes=True)


# =============================
# TICKET
# =============================

class TicketResponse(BaseModel):
    id: int
    event_name: str
    reference_number: str

    model_config = ConfigDict(from_attributes=True)