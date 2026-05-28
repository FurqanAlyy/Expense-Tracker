# ANSWERS.md

## 1. How to run

**Prerequisites:** Node.js >= 18 and a MongoDB connection string.

```bash
# Backend
cd backend
cp .env.example .env      # then set MONGO_URI in .env
npm install
npm run dev               # starts on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev               # opens on http://localhost:5173
```

Navigate to `http://localhost:5173` in a browser.

---

## 2. Stack choice

**MERN (MongoDB, Express, React, Vite)** was chosen because:

- **MongoDB** stores schema-flexible documents, making it easy to iterate on the expense shape without migrations.
- **Express** is minimal — enough to write clean REST routes without framework overhead.
- **React + Vite** gives a fast dev loop and component-level state that maps naturally to a form-driven CRUD app.

**A worse choice:** A monolithic server-rendered app with plain HTML/PHP. It would work, but updating a single expense would require a full page reload, making the filter + live-summary experience clunky. Alternatively, using a fully featured framework like Next.js would be over-engineered for an app that has no need for SSR or file-based routing.

---

## 3. One real edge case

**Edge case: CSV values containing commas or double-quotes**

File: `backend/routes/expenses.js`, lines 69–72

```js
const title = `"${e.title.replace(/"/g, '""')}"`;
const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
```

Every string field is wrapped in double quotes and any existing double-quote character is escaped by doubling it — this is the RFC 4180 CSV standard.

**Without this handling:** A title like `Lunch, "sushi"` would produce:

```
Lunch, "sushi",12.50,Food,2024-01-15,
```

That would be parsed as four columns instead of five, corrupting the entire row and any row after it in spreadsheet software.

---

## 4. AI usage

**Tool used:** Claude (claude-sonnet-4-6 via Claude Code)

| Where | What I asked | What it gave |
|-------|-------------|--------------|
| `routes/expenses.js` CSV export route | Asked for a CSV export endpoint | Generated the route with basic string join |
| `routes/expenses.js` lines 69-72 | Reviewed the CSV escaping logic | Suggested wrapping in quotes but missed the double-quote-within-quote case |
| `components/ExpenseList.jsx` | Scaffolded the list component | Generated working JSX |
| `index.css` | Asked for clean card-based layout | Generated styles with dark mode vars I didn't need |

**What I changed:** The AI's initial CSV export did not handle the case where a field value itself contains a double-quote character (e.g., a title like `Lunch "special"`). I added the `.replace(/"/g, '""')` escape so the output is valid RFC 4180. Without it, any expense with a quote in the title or notes would break the CSV structure.

I also stripped the dark-mode CSS variables from `index.css` — the AI defaulted to including them, but the app doesn't implement a dark mode toggle, so shipping half-implemented theming would be misleading.

---

## 5. Honest gap

**The gap:** There is no authentication. Anyone who can reach `localhost:5000` can read, modify, or delete all expenses.

**What I'd do with another day:** Add JWT-based auth — a `POST /api/auth/register` and `POST /api/auth/login` endpoint that issues a token, a `User` model in MongoDB, and an `authMiddleware` that gates every `/api/expenses` route. On the frontend, store the token in `localStorage` and attach it as a `Bearer` header via an Axios request interceptor. This would take roughly 3–4 hours and make the app genuinely multi-user safe.
