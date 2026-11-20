import Sidebar from '../components/layout/Sidebar';
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Summary from '../components/Summary';
import CategoryAccountManager from '../components/CategoryAccountManager';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
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
      const params = { page };
      if (filterType) params.type = filterType;
      if (filterCategory) params.category = filterCategory;

      const res = await api.get('/transactions/', { params });
      setTransactions(res.data.results);
      setCount(res.data.count);
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
      setCategories(catRes.data.results);
      setAccounts(accRes.data.results);
    } catch (err) {
      setError('Failed to load categories/accounts');
    }
  };

  useEffect(() => {
    fetchCategoriesAndAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory, page]);

  useEffect(() => {
    setPage(1);
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

  // Icons removed as per user request

  return (
    <div className="dashboard-layout">

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {error && <div className="card" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>{error}</div>}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <h2>Dashboard Overview</h2>
            <p>Welcome back! Here's a summary of your finances.</p>
            <Summary />
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="tab-pane">
            <h2>Transactions</h2>
            <p>Manage and track your income and expenses.</p>

            <div className="card">
              <div className="card-header">
                <h3>Add New Transaction</h3>
              </div>
              <form onSubmit={handleAddTransaction}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount</label>
                    <input type="number" name="amount" placeholder="0.00" value={form.amount} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={form.type} onChange={handleFormChange}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleFormChange} required>
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Account</label>
                    <select name="account" value={form.account} onChange={handleFormChange} required>
                      <option value="">Select Account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" name="date" value={form.date} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Note</label>
                    <input type="text" name="note" placeholder="Optional note" value={form.note} onChange={handleFormChange} />
                  </div>
                </div>
                <button type="submit" className="primary">Add Transaction</button>
              </form>
            </div>

            <div className="card">
              <div className="card-header" style={{flexWrap: 'wrap', gap: '1rem'}}>
                <h3>Recent Transactions</h3>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{width: '150px'}}>
                    <option value="">All Types</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{width: '180px'}}>
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <p>Loading transactions...</p>
              ) : transactions.length === 0 ? (
                <p>No transactions found.</p>
              ) : (
                <>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Category</th>
                          <th>Account</th>
                          <th>Amount</th>
                          <th>Note</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => (
                          <tr key={t.id}>
                            <td>{t.date}</td>
                            <td>
                              <span className={`badge ${t.type}`}>{t.type}</span>
                            </td>
                            <td>{t.category_name}</td>
                            <td>{t.account_name}</td>
                            <td style={{fontWeight: '600'}}>${parseFloat(t.amount).toFixed(2)}</td>
                            <td style={{color: 'var(--text-secondary)'}}>{t.note || '-'}</td>
                            <td>
                              <button className="danger" onClick={() => handleDelete(t.id)} style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="pagination">
                    <button className="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </button>
                    <span>
                      Page {page} of {Math.max(1, Math.ceil(count / 10))}
                    </span>
                    <button className="ghost" disabled={page * 10 >= count} onClick={() => setPage(page + 1)}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Manage Data Tab */}
        {activeTab === 'manage' && (
          <div className="tab-pane">
            <h2>Manage Data</h2>
            <p>Configure your categories and accounts.</p>
            <CategoryAccountManager
              categories={categories}
              accounts={accounts}
              onUpdate={fetchCategoriesAndAccounts}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;