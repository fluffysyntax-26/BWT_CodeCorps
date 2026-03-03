# AI-Powered Financial Safety & Decision Assistant

BWT Hackathon Project | Track: Finance (TRAE-Based Hackathon)

An AI-powered Financial Stability Companion designed to assist low-income households (e.g., ~₹15,000 monthly income) in making safer financial decisions using structured, responsible, and grounded artificial intelligence.

## System Architecture

The system follows a modular, secure layered architecture where AI acts strictly as an interpretation layer, ensuring all advice is grounded in deterministic financial data computed by the backend.

![Architecture Diagram](./architecture_diagram.png)

## Key Features

- **Secure Authentication:** Robust user authentication and session management powered by Clerk.
- **Expense Tracking:** Comprehensive tracking of daily expenses, categorized summaries, and disposable income monitoring.
- **Financial Metrics Engine:** Computes deterministic metrics including Debt-to-Income Ratio, Emergency Fund Coverage, and Savings Rate.
- **Decision Evaluation:** Rule-based risk assessment for major financial decisions (e.g., assuming new EMI obligations) based on current financial health.
- **Data-Grounded AI Assistant:** Conversational AI that provides contextual explanations for risks, strictly grounded in the user's specific financial data.

## Technology Stack

- **Frontend**
  - Framework: React.js (via Vite)
  - Authentication: Clerk Auth SDK
  - Styling: CSS / Tailwind CSS

- **Backend**
  - Framework: FastAPI (Python)
  - Authentication: Clerk JWT Verification Middleware
  - AI Integration: LLM API (Grounded Financial Reasoning)

- **Database**
  - Primary Database: MongoDB Atlas

- **Deployment (Planned)**
  - Frontend: Vercel
  - Backend: Render or Railway

## Project Structure

Clean file structure (proposed):

```
BWT_Hackathon/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/          # Dashboard, Expenses, Decision, Chat, History
│       ├── components/     # Navbar, Forms, RiskCard, Chat UI
│       ├── services/       # API and Chat service integrations
│       └── context/        # AuthContext
│
└── backend/
   ├── main.py
   ├── database.py
   ├── requirements.txt
   ├── routes/             # expenses.py, decision.py, chat.py
   ├── models/             # PyMongo models/schemas
   ├── services/           # metrics_engine.py, ai_service.py, chat_service.py
   └── utils/              # clerk_auth.py
```

## Getting Started (Local Setup)

### Prerequisites

- Node.js (v18+)
- Python 3.9+
- MongoDB Atlas Account
- Clerk Account
- LLM API Key (e.g., OpenAI, Gemini)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd BWT_Hackathon
```

### 2. Backend Setup

```bash
cd backend
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your keys
# MONGO_URI=your_mongodb_connection_string
# CLERK_SECRET_KEY=your_clerk_secret
# LLM_API_KEY=your_llm_api_key

# Run the FastAPI server
uvicorn main:app --reload

# Backend will run at http://localhost:8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create a .env file and add your Clerk publishable key
# VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
# VITE_API_URL=http://localhost:8000

# Start the development server
npm run dev

# Frontend will run at http://localhost:5173
```

## API Endpoints Overview

All endpoints require a valid Clerk JWT in the `Authorization: Bearer <token>` header.

| Module    | Method | Endpoint           | Description                           |
| --------- | ------ | ------------------ | ------------------------------------- |
| Expenses  | POST   | /expenses          | Add a new expense record              |
| Expenses  | GET    | /expenses          | Retrieve user expenses                |
| Expenses  | DELETE | /expenses/{id}     | Delete a specific expense             |
| Decisions | POST   | /evaluate-decision | Evaluate risk of a financial decision |
| Decisions | GET    | /decision-history  | View past evaluated decisions         |
| AI Chat   | POST   | /chat              | Send a message to the AI assistant    |
| AI Chat   | GET    | /chat-history      | Retrieve conversation history         |

## Database Design Highlights

The system relies on 4 primary MongoDB collections:

1. **Users:** Stores core financial profiles (income, fixed expenses, existing EMIs, savings). Indexed by `clerk_user_id`.
2. **Expenses:** Logs individual daily/monthly spending.
3. **Decisions:** Records deterministic metrics, risk level (Low, Moderate, High), and the AI's contextual evaluation for high-impact choices.
4. **Chat Messages:** Stores historical interactions with the financial safety assistant.

## Future Enhancements

- What-if Simulations: Visualize long-term financial trajectories.
- Credit Risk Scoring: Integrate formal credit evaluation systems.
- Regional Language Support: Accessibility for non-English speakers in Tier 2/3 cities.
- Microfinance Integration: Pipelines to safe, low-interest microfinance institutions.
- Progressive Web App (PWA): Easier access on low-end mobile devices.

---

Developed for the BWT Hackathon.
