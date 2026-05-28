export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses.length)
    return <p className="empty">No expenses found. Add one above!</p>;

  return (
    <ul className="expense-list">
      {expenses.map((e) => (
        <li key={e._id} className="expense-item">
          <div className="expense-main">
            <span className="expense-title">{e.title}</span>
            <span className={`category-badge cat-${e.category.toLowerCase()}`}>{e.category}</span>
          </div>
          <div className="expense-sub">
            <span className="expense-date">{new Date(e.date).toLocaleDateString()}</span>
            {e.notes && <span className="expense-notes">{e.notes}</span>}
          </div>
          <div className="expense-right">
            <span className="expense-amount">Rs {Number(e.amount).toFixed(2)}</span>
            <button onClick={() => onEdit(e)} className="icon-btn edit-btn" title="Edit">✏️</button>
            <button onClick={() => onDelete(e._id)} className="icon-btn delete-btn" title="Delete">🗑️</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
