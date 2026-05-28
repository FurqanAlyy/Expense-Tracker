# ANSWERS.md

## 1. How to run

**Prerequisites:** Node.js >= 18. No database needed.

```bash
# Backend
cd backend
npm install
npm run dev        # starts on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # opens on http://localhost:5173
```

Navigate to `http://localhost:5173` in a browser. Data persists to `backend/data/expenses.json`.

---

## 2. Stack choice

**Stack:** React + Vite (frontend), Express + Node.js (backend), JSON file (storage).

**Why this stack:**
- **React + Vite** gives a fast dev loop and component-level state that maps naturally to a form-driven CRUD app.
- **Express** is minimal — enough to write clean REST routes without framework overhead.
- **JSON file storage** was a deliberate choice over MongoDB: zero setup for anyone running the project, the data file is visible in the repo, and it removes the need to share credentials or spin up a database. For an app at this scale (hundreds of records), flat-file JSON is perfectly adequate.

**A worse choice:** Using a hosted database (e.g., MongoDB Atlas) would require sharing a connection string, creating an account, and whitelisting IPs — all friction that adds nothing for a single-user local app. SQLite would be a reasonable middle ground but adds a binary dependency and driver setup that JSON with `fs` simply doesn't need.

---

## 3. One real edge case

**Edge case: missing or corrupted data file on first run**

File: `backend/utils/storage.js`, lines 8–11

```js
  } catch {
    // file missing or corrupted — start fresh
    return [];
  }
```

`readExpenses()` wraps `fs.readFile` + `JSON.parse` in a try/catch. If the file doesn't exist yet (fresh clone, first run) or has been corrupted (truncated write, manual edit gone wrong), the catch returns an empty array instead of crashing.

**Without this handling:** The server would throw an unhandled error on the very first request — `ENOENT: no such file or directory` — and every subsequent API call would return a 500 until the file was manually created. A fresh clone would be completely broken out of the box.

---

## 4. AI usage

**Tool used:** Claude (claude-sonnet-4-6 via Claude Code)

| Where | What I asked | What it gave |
|-------|-------------|--------------|
| `routes/expenses.js` — initial scaffold | Asked to generate CRUD routes | Generated routes with MongoDB/Mongoose |
| `utils/storage.js` | Asked to replace Mongoose with file-based storage | Generated `readExpenses`/`writeExpenses` with try/catch |
| `routes/expenses.js` CSV export | Asked for a CSV export endpoint | Generated the route but placed it after `/:id` |
| `index.css` | Asked for a clean card-based layout | Generated styles with dark-mode variables |

**What I changed:** The AI placed the `/export/csv` route *after* the `/:id` route. In Express, `/:id` is a wildcard — it would match the literal string `"export"` and treat it as an ID lookup, meaning the CSV endpoint would never be reached. I moved `/export/csv` above `/:id` to fix this. This is a subtle ordering bug that the AI didn't flag.

I also stripped the dark-mode CSS variables — the AI defaulted to including them, but shipping half-implemented theming that does nothing would look worse than not having it at all.

---

## 5. Honest gap

**The gap:** The file storage has no write locking. If two requests arrive simultaneously (e.g., two rapid deletes), both could read the same snapshot of `expenses.json`, make their change, and the second write would silently overwrite the first — one deletion would be lost.

**What I'd do with another day:** Add a simple async mutex (e.g., the `async-mutex` npm package) around every read-modify-write cycle in `storage.js`. Alternatively, migrate to SQLite with the `better-sqlite3` package, which handles concurrent access correctly at the OS level and is still zero-config for anyone cloning the repo.
