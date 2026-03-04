def calculate_dti(monthly_income: float, total_monthly_debt: float) -> float:
    """
    Calculates the Debt-to-Income (DTI) ratio as a percentage.
    Lower is better.
    """
    if monthly_income <= 0:
        return 100.0
    return round((total_monthly_debt / monthly_income) * 100, 2)


def calculate_savings_rate(monthly_income: float, monthly_savings_contribution: float) -> float:
    """
    Calculates the percentage of income being saved each month.
    """
    if monthly_income <= 0:
        return 0.0
    return round((monthly_savings_contribution / monthly_income) * 100, 2)


def calculate_emergency_fund_coverage(total_savings: float, average_monthly_expenses: float) -> float:
    """
    Calculates how many months the user can survive on their current savings.
    """
    if average_monthly_expenses <= 0:
        return 0.0
    return round(total_savings / average_monthly_expenses, 1)


def calculate_emi(principal: float, annual_interest_rate: float, tenure_months: int) -> float:
    """
    Calculates the Equated Monthly Installment (EMI) for a loan.
    Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    """
    if tenure_months <= 0:
        return principal  # Immediate payment
    
    if annual_interest_rate <= 0:
        return principal / tenure_months

    monthly_rate = annual_interest_rate / (12 * 100)
    emi = (principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)) / (((1 + monthly_rate) ** tenure_months) - 1)
    return round(emi, 2)


def evaluate_decision_risk(
        monthly_income: float,
        current_monthly_debt: float,
        new_monthly_obligation: float,
        savings_rate: float,
        total_savings: float = 0.0,
        fixed_expenses: float = 0.0
) -> dict:
    """
    Rule-based risk assessment for major financial decisions based on current financial health.
    Evaluates risk level as Low, Moderate, or High.
    """
    projected_total_debt = current_monthly_debt + new_monthly_obligation
    projected_dti = calculate_dti(monthly_income, projected_total_debt)
    
    # Calculate emergency fund coverage with new expenses (assuming new obligation adds to monthly burn)
    projected_monthly_expenses = fixed_expenses + new_monthly_obligation
    emergency_fund_months = calculate_emergency_fund_coverage(total_savings, projected_monthly_expenses)

    # Risk Assessment Logic
    risk_level = "Low"
    recommendations = []

    # Check DTI
    if projected_dti > 45.0:
        risk_level = "High"
        recommendations.append("Your projected DTI is critically high (>45%). Consider extending the loan tenure to reduce monthly EMI.")
    elif projected_dti > 30.0:
        risk_level = "Moderate" if risk_level != "High" else risk_level
        recommendations.append("Your DTI is above the recommended 30%. Monitor your expenses closely.")

    # Check Emergency Fund
    if emergency_fund_months < 3.0:
        risk_level = "High"
        recommendations.append(f"Your emergency fund ({emergency_fund_months} months) is dangerously low (<3 months).")
    elif emergency_fund_months < 6.0:
        risk_level = "Moderate" if risk_level != "High" else risk_level
        recommendations.append("Your emergency fund is healthy but below the ideal 6 months buffer.")

    # Check Savings Rate
    if savings_rate < 10.0:
        risk_level = "Moderate" if risk_level != "High" else risk_level
        recommendations.append("Your savings rate is low (<10%). Try to boost savings before taking this loan.")

    # Final Low Risk Confirmation
    if risk_level == "Low":
        recommendations.append("Your financial health looks good to support this decision.")
        recommendations.append("Consider investing any surplus from this EMI budget into a high-yield fund.")

    return {
        "projected_dti": projected_dti,
        "risk_level": risk_level,
        "emergency_fund_months": emergency_fund_months,
        "recommendations": recommendations,
        "new_emi_impact_percentage": round((new_monthly_obligation / monthly_income) * 100, 1) if monthly_income > 0 else 0
    }
