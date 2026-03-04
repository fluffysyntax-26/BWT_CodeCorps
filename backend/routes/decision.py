from fastapi import APIRouter, Depends, HTTPException
from models.schemas import DecisionRequest
from utils.clerk_auth import get_current_user
from database import decisions_collection, users_collection
from services.metrics_engine import evaluate_decision_risk, calculate_emi
from services.ai_service import evaluate_decision_explanation
from datetime import datetime, timezone

router = APIRouter()


@router.post("/evaluate-decision", description="Evaluate risk of a financial decision")
async def evaluate_decision(
    request: DecisionRequest, user_id: str = Depends(get_current_user)
):
    user_profile = await users_collection.find_one({"user_id": user_id})

    if not user_profile or user_profile.get("monthly_income", 0) <= 0:
        return {
            "warning": True,
            "message": "Please set up your financial profile in the Dashboard first with a valid monthly income before evaluating decisions.",
            "risk_level": "Unknown",
            "metrics_at_evaluation": {
                "monthly_income": 0,
                "projected_dti_percentage": 0,
                "current_savings_rate": 0,
            },
            "ai_explanation": "We couldn't evaluate your decision because we don't have your financial profile. Please go to the Dashboard and enter your monthly income, current EMI/debt, and target savings rate. Once we have this information, we can provide you with accurate risk assessments.",
        }

    user_income = user_profile.get("monthly_income", 0.0)
    current_debt = user_profile.get("current_debt", 0.0)
    savings_rate = user_profile.get("savings_rate", 0.0)
    total_savings = user_profile.get("current_savings", 0.0)
    fixed_expenses = user_profile.get("fixed_expenses", 0.0)

    # Calculate EMI based on interest rate and duration
    new_emi = calculate_emi(
        principal=request.amount,
        annual_interest_rate=request.interest_rate or 0.0,
        tenure_months=request.duration_months or 12
    )

    evaluation = evaluate_decision_risk(
        monthly_income=user_income,
        current_monthly_debt=current_debt,
        new_monthly_obligation=new_emi,
        savings_rate=savings_rate,
        total_savings=total_savings,
        fixed_expenses=fixed_expenses
    )

    metrics_context = {
        "monthly_income": user_income,
        "projected_dti_percentage": evaluation["projected_dti"],
        "current_savings_rate": savings_rate,
        "emergency_fund_months": evaluation["emergency_fund_months"],
        "new_emi_impact_percentage": evaluation["new_emi_impact_percentage"],
        "calculated_emi": new_emi
    }

    ai_explanation = await evaluate_decision_explanation(
        decision_data=request.model_dump(),
        risk_level=evaluation["risk_level"],
        metrics=metrics_context,
    )

    decision_record = {
        "user_id": user_id,
        "decision": request.model_dump(),
        "metrics_at_evaluation": metrics_context,
        "risk_level": evaluation["risk_level"],
        "recommendations": evaluation["recommendations"],
        "ai_explanation": ai_explanation,
        "created_at": datetime.now(timezone.utc),
    }

    result = await decisions_collection.insert_one(decision_record)
    decision_record["_id"] = str(result.inserted_id)

    return decision_record
