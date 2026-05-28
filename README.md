# Expense Tracker

A full-stack MERN expense tracker with CRUD, filtering, and CSV export. Data persists to a local JSON file — no database setup required.

## Prerequisites

- Node.js >= 18

## Run on a fresh machine
First download the repo from github on your local system
https://github.com/FurqanAlyy/Expense-Tracker.git

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`. Expense data is stored in `backend/data/expenses.json`.

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Features

- Create, view, edit, and delete expense entries
- Filter by category, date range, or title search
- Live spending summary with per-category totals
- **Export all expenses to CSV** — click the "Export CSV" button

## Persistence

All expenses are saved to `backend/data/expenses.json`. Close the server, restart it, and your data will still be there.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/expenses | List expenses (supports ?search, ?category, ?startDate, ?endDate) |
| GET | /api/expenses/export/csv | Download all expenses as CSV |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
