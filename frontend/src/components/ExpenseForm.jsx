import { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];

const empty = { title: '', amount: '', category: 'Food', date: '', notes: '' };

export default function ExpenseForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        amount: initial.amount,
        category: initial.category,
        date: new Date(initial.date).toISOString().split('T')[0],
        notes: initial.notes || '',
      });
    } else {
      setForm(empty);
    }
  }, [initial]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.date) return;
    onSubmit({ ...form, amount: parseFloat(form.amount) });
    setForm(empty);
  };

  return (
    <form onSubmit={submit} className="expense-form">
      <h2>{initial ? 'Edit Expense' : 'Add Expense'}</h2>

      <label>Title
        <input name="title" value={form.title} onChange={handle} required placeholder="e.g. Lunch" />
      </label>

      <label>Amount (Rs)
        <input name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handle} required placeholder="500" />
      </label>

      <label>Category
        <select name="category" value={form.category} onChange={handle}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <label>Date
        <input name="date" type="date" value={form.date} onChange={handle} required />
      </label>

      <label>Notes
        <textarea name="notes" value={form.notes} onChange={handle} placeholder="Optional notes" rows={2} />
      </label>

      <div className="form-actions">
        <button type="submit">{initial ? 'Update' : 'Add Expense'}</button>
        {onCancel && <button type="button" onClick={onCancel} className="secondary">Cancel</button>}
      </div>
    </form>
  );
}
