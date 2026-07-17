import { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

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
    <div style={{ marginBottom: '2rem' }}>
      <h3>Monthly Income vs Expense</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {monthlyData.length === 0 ? (
        <p>No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#82ca9d" />
            <Bar dataKey="expense" fill="#ff8042" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <h3>Spending by Category</h3>
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
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Summary;