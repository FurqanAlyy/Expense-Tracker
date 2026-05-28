const CATEGORIES = ['', 'Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];

export default function Filters({ filters, onChange }) {
  const handle = (e) => onChange({ ...filters, [e.target.name]: e.target.value });

  return (
    <div className="filters">
      <input
        name="search"
        placeholder="Search by title..."
        value={filters.search}
        onChange={handle}
      />
      <select name="category" value={filters.category} onChange={handle}>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
      </select>
      <input name="startDate" type="date" value={filters.startDate} onChange={handle} title="From" />
      <input name="endDate" type="date" value={filters.endDate} onChange={handle} title="To" />
    </div>
  );
}
