export default function Summary({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="summary">
      <div className="summary-total">
        Total: <strong>${total.toFixed(2)}</strong>
      </div>
      <div className="summary-cats">
        {Object.entries(byCategory).map(([cat, amt]) => (
          <span key={cat} className={`category-badge cat-${cat.toLowerCase()}`}>
            {cat}: ${amt.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  );
}
