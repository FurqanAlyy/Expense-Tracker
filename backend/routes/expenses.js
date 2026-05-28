const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const { readExpenses, writeExpenses } = require('../utils/storage');

const VALID_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];

// GET /export/csv — must be defined before /:id to avoid route conflict
router.get('/export/csv', async (req, res) => {
  try {
    const expenses = await readExpenses();

    const header = 'Title,Amount,Category,Date,Notes\n';
    const rows = expenses.map((e) => {
      const title = `"${e.title.replace(/"/g, '""')}"`;
      const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
      const date = new Date(e.date).toISOString().split('T')[0];
      return `${title},${e.amount},${e.category},${date},${notes}`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(header + rows.join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    let expenses = await readExpenses();
    const { category, startDate, endDate, search } = req.query;

    if (category) expenses = expenses.filter((e) => e.category === category);
    if (startDate) expenses = expenses.filter((e) => new Date(e.date) >= new Date(startDate));
    if (endDate) expenses = expenses.filter((e) => new Date(e.date) <= new Date(endDate));
    if (search) expenses = expenses.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expenses = await readExpenses();
    const expense = expenses.find((e) => e._id === req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    if (!title || !amount || !category || !date)
      return res.status(400).json({ message: 'title, amount, category, and date are required' });

    if (!VALID_CATEGORIES.includes(category))
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });

    if (isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ message: 'amount must be a positive number' });

    const expense = {
      _id: randomUUID(),
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString(),
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const expenses = await readExpenses();
    expenses.push(expense);
    await writeExpenses(expenses);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const expenses = await readExpenses();
    const index = expenses.findIndex((e) => e._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Expense not found' });

    const { title, amount, category, date, notes } = req.body;

    if (category && !VALID_CATEGORIES.includes(category))
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });

    if (amount !== undefined && (isNaN(amount) || Number(amount) <= 0))
      return res.status(400).json({ message: 'amount must be a positive number' });

    expenses[index] = {
      ...expenses[index],
      ...(title !== undefined && { title: title.trim() }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(category !== undefined && { category }),
      ...(date !== undefined && { date: new Date(date).toISOString() }),
      ...(notes !== undefined && { notes: notes.trim() }),
      updatedAt: new Date().toISOString(),
    };

    await writeExpenses(expenses);
    res.json(expenses[index]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const expenses = await readExpenses();
    const index = expenses.findIndex((e) => e._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Expense not found' });

    expenses.splice(index, 1);
    await writeExpenses(expenses);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
