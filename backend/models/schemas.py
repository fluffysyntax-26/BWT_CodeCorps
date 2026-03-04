# backend/models/schemas.py
from pydantic import BaseModel, Field
from typing import Optional


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None  # ISO format date string YYYY-MM-DD


class DecisionRequest(BaseModel):
    decision_type: str = Field(
        ..., description="e.g., New EMI, Vehicle Loan, Medical Emergency"
    )
    amount: float
    interest_rate: Optional[float] = 0.0
    duration_months: Optional[int] = 12
    description: Optional[str] = None


class UserProfile(BaseModel):
    monthly_income: float = Field(..., description="User's total monthly income")
    current_debt: float = Field(
        ..., description="User's current total monthly debt obligations"
    )
    savings_rate: Optional[float] = Field(None, description="Percentage of income saved monthly")
    fixed_expenses: float = Field(..., description="User's fixed monthly expenses")
    current_savings: float = Field(..., description="User's current total savings")


class ChatRequest(BaseModel):
    message: str
