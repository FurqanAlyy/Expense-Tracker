import { useState, useEffect, useCallback } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense, exportCSV } from './api';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import Filters from './components/Filters';

const defaultFilters = { search: '', category: '', startDate: '', endDate: '' };

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await getExpenses(params);
      setExpenses(data);
      setError('');
    } catch {
      setError('Failed to load expenses. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleCreate = async (data) => {
    try {
      await createExpense(data);
      fetchExpenses();
    } catch {
      setError('Failed to create expense.');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateExpense(editing._id, data);
      setEditing(null);
      fetchExpenses();
    } catch {
      setError('Failed to update expense.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch {
      setError('Failed to delete expense.');
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await exportCSV();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export CSV.');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Expense Tracker</h1>
        <button onClick={handleExport} className="export-btn">&#8595; Export CSV</button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <ExpenseForm
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      <Summary expenses={expenses} />

      <Filters filters={filters} onChange={setFilters} />

      {loading ? <p className="loading">Loading...</p> : (
        <ExpenseList expenses={expenses} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  );
}
