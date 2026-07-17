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
    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
      <div>
        <h4>Categories</h4>
        <ul>
          {categories.map((c) => <li key={c.id}>{c.name}</li>)}
        </ul>
        <form onSubmit={addCategory}>
          <input
            type="text"
            placeholder="New category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      <div>
        <h4>Accounts</h4>
        <ul>
          {accounts.map((a) => <li key={a.id}>{a.name}</li>)}
        </ul>
        <form onSubmit={addAccount}>
          <input
            type="text"
            placeholder="New account"
            value={newAccount}
            onChange={(e) => setNewAccount(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CategoryAccountManager;