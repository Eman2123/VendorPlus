# VendorPlus

VendorPlus is an AI-powered supplier follow-up and risk monitoring platform that automates vendor status calls, turns supplier responses into structured delivery intelligence, and highlights vendors that need attention.

## What it does

VendorPlus replaces repetitive manual supplier follow-ups with an automated workflow:

1. Select vendors that need a status check.
2. Initiate AI phone calls to suppliers through CALL-E.
3. Capture and process the supplier's response.
4. Extract structured delivery information from the conversation.
5. Calculate a vendor risk score based on delivery signals.
6. Escalate high-risk vendors so procurement teams can act early.
7. Track vendors, call history, risk, and escalations from one dashboard.

## Key Features

- **Automated vendor calls** — initiate supplier follow-ups without manual calling.
- **AI response extraction** — convert natural-language call responses into structured data.
- **Risk scoring** — identify vendors that are likely to miss delivery commitments.
- **Automatic escalation** — surface high-risk vendors for immediate attention.
- **Vendor dashboard** — monitor vendor status and overall delivery risk.
- **Call history** — review previous supplier interactions and extracted results.
- **Procurement-focused workflow** — designed around proactive supplier monitoring rather than reactive follow-up.

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn

### AI & Integrations
- CALL-E for AI-powered phone calls
- Automated conversation result extraction
- Vendor risk evaluation and escalation logic

## Project Structure

```text
VendorPlus/
├── backend/
│   ├── app/
│   │   ├── db/             # Database models and schema
│   │   ├── routers/        # API routes
│   │   ├── schemas/        # Request/response schemas
│   │   ├── services/       # Calls, extraction, risk and alerts
│   │   └── main.py         # FastAPI application
│   ├── .env.example
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js application routes
│   └── package.json
├── docs/
│   ├── apicontract.md
│   └── technical-notes.md
└── README.md
```

## Getting Started

## Live Deployment

- **Frontend:** https://vendor-plus-xi.vercel.app
- **Backend API:** https://vendorplus.fastapicloud.dev
- **API Docs (Swagger):** https://vendorplus.fastapicloud.dev/docs


### 1. Clone the repository

```bash
git clone https://github.com/Eman2123/VendorPlus.git
cd VendorPlus
```

### 2. Run the backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env` using these variables:

```text
DATABASE_URL=
CALLE_API_KEY=
CALLE_ACCOUNT_EMAIL=
ALERT_EMAIL_FROM=
ALERT_EMAIL_APP_PASSWORD=
```


This project also requires the CALL-E CLI to place real phone calls:

```bash
npm install -g @call-e/cli
calle auth login
```

This opens a one-time browser login. The resulting session token is cached locally and reused automatically. 



Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

FastAPI interactive documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `CALLE_API_KEY` | CALL-E API authentication |
| `CALLE_ACCOUNT_EMAIL` | CALL-E account email |
| `ALERT_EMAIL_FROM` | Sender address for alerts |
| `ALERT_EMAIL_APP_PASSWORD` | App password used for alert email delivery |

Never commit real credentials or `.env` files to the repository.

## Core Workflow

```text
Vendor
  ↓
Scheduled / Manual Status Check
  ↓
CALL-E Phone Call
  ↓
Supplier Response
  ↓
Result Extraction
  ↓
Risk Engine
  ↓
Vendor Risk Status
  ↓
Escalation / Alert
  ↓
Procurement Dashboard
```

## API

The backend exposes endpoints for vendor management, phone calls, dashboard data, and related procurement workflows.

See [`docs/apicontract.md`](docs/apicontract.md) for the API contract and [`docs/technical-notes.md`](docs/technical-notes.md) for implementation details.

## Why VendorPlus?

Supplier delays are often discovered after they have already affected a delivery timeline. VendorPlus focuses on **early visibility** by checking in with suppliers, interpreting their responses, and turning those conversations into actionable risk signals.

Instead of asking procurement teams to manually chase every vendor, VendorPlus helps them focus on the vendors that need intervention most.

## Status

VendorPlus is an active hackathon project and is being developed as a prototype for AI-driven procurement and supplier risk monitoring.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.
