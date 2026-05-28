const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) filter.title = { $regex: search, $options: 'i' };

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
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
    if (!title || !amount || !category || !date) {
      return res.status(400).json({ message: 'title, amount, category, and date are required' });
    }
    const expense = new Expense({ title, amount, category, date, notes });
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET CSV export
router.get('/export/csv', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

    const header = 'Title,Amount,Category,Date,Notes\n';
    const rows = expenses.map((e) => {
      const title = `"${e.title.replace(/"/g, '""')}"`;
      const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
      const date = new Date(e.date).toISOString().split('T')[0];
      return `${title},${e.amount},${e.category},${date},${notes}`;
    });

    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
