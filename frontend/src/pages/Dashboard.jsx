import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Summary from '../components/Summary';
import CategoryAccountManager from '../components/CategoryAccountManager';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filters
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // new transaction form
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    account: '',
    note: '',
    date: '',
  });

  const { logout } = useAuth();

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterCategory) params.category = filterCategory;

      const res = await api.get('/transactions/', { params });
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndAccounts = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        api.get('/categories/'),
        api.get('/accounts/'),
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data);
    } catch (err) {
      setError('Failed to load categories/accounts');
    }
  };

  useEffect(() => {
    fetchCategoriesAndAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/transactions/', form);
      setForm({ amount: '', type: 'expense', category: '', account: '', note: '', date: '' });
      fetchTransactions();
    } catch (err) {
      setError('Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}/`);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Summary />
      <CategoryAccountManager
        categories={categories}
        accounts={accounts}
        onUpdate={fetchCategoriesAndAccounts}
      />

      <h3>Add Transaction</h3>
      <form onSubmit={handleAddTransaction} style={{ marginBottom: '2rem' }}>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleFormChange}
          required
        />
        <select name="type" value={form.type} onChange={handleFormChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select name="category" value={form.category} onChange={handleFormChange} required>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="account" value={form.account} onChange={handleFormChange} required>
          <option value="">Select Account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleFormChange}
          required
        />
        <input
          type="text"
          name="note"
          placeholder="Note (optional)"
          value={form.note}
          onChange={handleFormChange}
        />
        <button type="submit">Add</button>
      </form>

      <h3>Filters</h3>
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
        <option value="">All Types</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <h3>Transactions</h3>
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>{t.category_name}</td>
                <td>{t.account_name}</td>
                <td>{t.amount}</td>
                <td>{t.note}</td>
                <td>
                  <button onClick={() => handleDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;