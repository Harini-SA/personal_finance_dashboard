import Sidebar from '../components/layout/sidebar';
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Summary from '../components/Summary';
import CategoryAccountManager from '../components/CategoryAccountManager';
import Budgets from './Budgets';
import Transactions from './Transactions';

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
      fetchCategoriesAndAccounts();
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

{/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="tab-pane">
            <h2>My Accounts</h2>
            <p>View all your financial accounts.</p>

            <div className="card">
              <div className="card-header">
                <h3>Your Accounts</h3>
                <span>{accounts.length} Accounts</span>
              </div>

              <div className="accounts-grid">
                {accounts.length === 0 ? (
                  <p>No accounts found. Add an account in Manage Data.</p>
                ) : (
                  accounts.map((account) => (
                    <div className="card" key={account.id}>
                      <h3>{account.name}</h3>
                      <p>Financial Account</p>
                      <p>
                Initial Balance: ₹
                {Number(account.opening_balance).toFixed(2)}
              </p>

              <h4>
                Current Balance: ₹
                {Number(account.balance).toFixed(2)}
              </h4>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'budgets' && (
  <div className="tab-pane">
    <Budgets />
  </div>
)}
        {/* Transactions Tab */}
{/* Transactions Tab */}
{activeTab === 'transactions' && (
    <div className="tab-pane">
<Transactions onAccountsUpdate={fetchCategoriesAndAccounts} />     </div>
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