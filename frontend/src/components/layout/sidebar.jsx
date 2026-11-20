import './sidebar.css';
function Sidebar({ activeTab, onTabChange, onLogout }) {
  const navigationItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'savings', label: 'Savings Goals' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'ai-advisor', label: 'AI Budget Advisor' },
    { id: 'simulator', label: 'What-If Simulator' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Fin<span>Dash</span></h2>
        <p>Personal Finance</p>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">MENU</p>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link ${
                activeTab === item.id ? 'active' : ''
              }`}
              onClick={() => onTabChange(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-link logout-link"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
