import { useState } from 'react';
import api from '../api';

function CategoryAccountManager({ categories, accounts, onUpdate }) {
  const [newCategory, setNewCategory] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [error, setError] = useState('');

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setError('');
    try {
      await api.post('/categories/', { name: newCategory });
      setNewCategory('');
      onUpdate();
    } catch (err) {
      setError('Failed to add category');
    }
  };

  const addAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.trim()) return;
    setError('');
    try {
      await api.post('/accounts/', { name: newAccount });
      setNewAccount('');
      onUpdate();
    } catch (err) {
      setError('Failed to add account');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      
      {/* Categories Card */}
      <div className="card">
        <div className="card-header">
          <h3>Categories</h3>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map((c) => (
            <li key={c.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>{c.name}</span>
            </li>
          ))}
          {categories.length === 0 && <p>No categories found.</p>}
        </ul>
        <form onSubmit={addCategory} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit" className="primary">Add</button>
        </form>
      </div>

      {/* Accounts Card */}
      <div className="card">
        <div className="card-header">
          <h3>Accounts</h3>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {accounts.map((a) => (
            <li key={a.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontWeight: 500 }}>{a.name}</span>
            </li>
          ))}
          {accounts.length === 0 && <p>No accounts found.</p>}
        </ul>
        <form onSubmit={addAccount} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New account name"
            value={newAccount}
            onChange={(e) => setNewAccount(e.target.value)}
          />
          <button type="submit" className="primary">Add</button>
        </form>
      </div>

      {error && <div style={{ color: 'var(--danger-color)', gridColumn: '1 / -1' }}>{error}</div>}
    </div>
  );
}

export default CategoryAccountManager;