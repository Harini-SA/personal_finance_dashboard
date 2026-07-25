import { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function Summary() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const [monthlyRes, categoryRes] = await Promise.all([
        api.get('/summary/monthly/'),
        api.get('/summary/category/'),
      ]);

      // Reshape monthly data: group by month, separate income/expense into columns
      const grouped = {};
      monthlyRes.data.forEach((row) => {
        const monthLabel = row.month.slice(0, 7); // "2026-07"
        if (!grouped[monthLabel]) {
          grouped[monthLabel] = { month: monthLabel, income: 0, expense: 0 };
        }
        grouped[monthLabel][row.type] = parseFloat(row.total);
      });
      setMonthlyData(Object.values(grouped));

      // Category data: rename for chart readability
      const catFormatted = categoryRes.data.map((row) => ({
        name: row.category__name || 'Uncategorized',
        total: parseFloat(row.total),
      }));
      setCategoryData(catFormatted);
    } catch (err) {
      setError('Failed to load summary data');
    }
  };

  return (
    <div className="form-grid" style={{ marginBottom: '2rem' }}>
      {error && <div style={{ color: 'red', width: '100%' }}>{error}</div>}
      
      <div className="card">
        <div className="card-header">
          <h3>Monthly Income vs Expense</h3>
        </div>
        {monthlyData.length === 0 ? (
          <p>No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{fill: 'var(--text-secondary)'}} />
              <YAxis tick={{fill: 'var(--text-secondary)'}} />
              <Tooltip contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Spending by Category</h3>
        </div>
        {categoryData.length === 0 ? (
          <p>No expense data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default Summary;