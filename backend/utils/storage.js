const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/expenses.json');

async function readExpenses() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    // file missing or corrupted — start fresh
    return [];
  }
}

async function writeExpenses(expenses) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(expenses, null, 2));
}

module.exports = { readExpenses, writeExpenses };
