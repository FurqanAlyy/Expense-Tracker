# Expense Tracker

A full-stack MERN expense tracker with CRUD, filtering, and CSV export.

## Prerequisites

- Node.js >= 18
- A MongoDB connection string (MongoDB Atlas free tier works)

## Setup & Run

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd expenseTracker
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

## Features

- Create, view, edit, and delete expense entries
- Filter by category, date range, or title search
- Live spending summary with per-category totals
- **Export all expenses to CSV** — click the "Export CSV" button

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/expenses | List expenses (supports ?search, ?category, ?startDate, ?endDate) |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/expenses/export/csv | Download CSV |
