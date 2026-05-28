# ANSWERS.md

## 1. How to run

**Prerequisites:** Node.js >= 18. No database needed.

First download the repo from github on your local system
https://github.com/FurqanAlyy/Expense-Tracker.git

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

I used Claude (Sonnet, through Claude Code) while building this. Here's where:

- **CRUD routes** — I had it scaffold the initial Express routes for me. It first gave me a version using MongoDB/Mongoose, which I didn't want, so I had it redo the storage as flat-file JSON instead.
- **`utils/storage.js`** — generated the `readExpenses`/`writeExpenses` helpers with the try/catch around the file read.
- **CSV export route** — I asked for an export endpoint.
- **`index.css`** — asked for a card-based layout to start from.

The thing I actually had to fix myself: the AI put the `/export/csv` route *after* the `/:id` route in `routes/expenses.js`. In Express that's broken, because `/:id` matches anything — it would've grabbed the string `"export"` and treated it as an ID, so the CSV endpoint would never run. Took me a bit to figure out why my export kept 404-ing weird. I moved `/export/csv` above `/:id` and it worked. The AI never warned me about ordering.

I also deleted the dark-mode CSS variables it threw in. It added them by default, but they didn't actually do anything — I figured shipping half-built theming that does nothing looks worse than not having it, so I cut it.

---

## 5. Honest gap

**The gap:** my file storage has no write locking. If two requests hit at the same time (say two quick deletes), both can read the same version of `expenses.json`, make their edit, and the second write overwrites the first — so one of the deletes just disappears.

Honestly, if this were going to be deployed for real, I wouldn't use a JSON file at all — I'd go with MongoDB or another proper database that handles concurrent writes for you. For this assessment I picked file-based storage on purpose because it's zero-setup for whoever's running it and you can see the data right there in the repo, but I know it doesn't scale past a single local user.

**What I'd do with another day:** I'd switch the storage to a real database like MongoDB. It handles multiple writes at once on its own, so I wouldn't have to worry about one change overwriting another, and it's a better fit if the app ever grows beyond a single local user.