import { useEffect, useState } from 'react';
import api from '../api';

const initialForm = {
  name: '',
  target_amount: '',
  current_amount: '0',
  target_date: '',
};

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchGoals = async () => {
    setLoading(true);

    try {
      const response = await api.get('/savings-goals/');
      setGoals(response.data.results || response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching savings goals:', err);
      setError('Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({ ...initialForm });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const target = Number(formData.target_amount);
    const current = Number(formData.current_amount);

    if (!formData.name.trim()) {
      setError('Please enter a goal name.');
      return;
    }

    if (
      !formData.target_amount ||
      !Number.isFinite(target) ||
      target <= 0
    ) {
      setError('Target amount must be greater than zero.');
      return;
    }

    if (
      formData.current_amount === '' ||
      !Number.isFinite(current) ||
      current < 0
    ) {
      setError('Current saved amount cannot be negative.');
      return;
    }

    if (!formData.target_date) {
      setError('Please select a target date.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      target_amount: target,
      current_amount: current,
      target_date: formData.target_date,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/savings-goals/${editingId}/`, payload);
      } else {
        await api.post('/savings-goals/', payload);
      }

      await fetchGoals();

      setSuccess(
        editingId
          ? 'Savings goal updated successfully!'
          : 'Savings goal created successfully!'
      );

      resetForm();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : 'Failed to save savings goal.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setFormData({
      name: goal.name,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      target_date: goal.target_date,
    });

    setEditingId(goal.id);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/savings-goals/${id}/`);

      if (editingId === id) {
        resetForm();
      }

      await fetchGoals();
      setSuccess('Savings goal deleted successfully!');
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete savings goal.');
    }
  };

  const getProgress = (goal) => {
    const target = Number(goal.target_amount);
    const current = Number(goal.current_amount);

    if (target <= 0) return 0;

    return Math.min((current / target) * 100, 100);
  };

  const getRemaining = (goal) => {
    return Math.max(
      Number(goal.target_amount) - Number(goal.current_amount),
      0
    );
  };

  return (
    <div className="container-fluid">

      <h3 className="mb-4">Savings Goals</h3>

      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h5 className="card-title mb-3">
            {editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}
          </h5>

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Buy a Laptop"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Target Amount</label>
                <input
                  type="number"
                  name="target_amount"
                  className="form-control"
                  placeholder="Enter target amount"
                  min="0.01"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Current Saved Amount</label>
                <input
                  type="number"
                  name="current_amount"
                  className="form-control"
                  placeholder="Enter current savings"
                  min="0"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  name="target_date"
                  className="form-control"
                  value={formData.target_date}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="mt-3">

              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Goal'
                    : 'Create Goal'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <h5 className="mb-3">Your Savings Goals</h5>

      {loading ? (
        <p>Loading savings goals...</p>
      ) : goals.length === 0 ? (
        <div className="alert alert-info">
          No savings goals yet. Create your first goal above!
        </div>
      ) : (

        <div className="row g-3">

          {goals.map((goal) => {
            const progress = getProgress(goal);
            const remaining = getRemaining(goal);
            const completed =
              Number(goal.current_amount) >= Number(goal.target_amount);

            return (
              <div className="col-12 col-md-6" key={goal.id}>

                <div className="card shadow-sm h-100">
                  <div className="card-body">

                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="card-title">{goal.name}</h5>

                      <span
                        className={`badge ${
                          completed ? 'bg-success' : 'bg-primary'
                        }`}
                      >
                        {completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    <p className="text-muted mb-2">
                      Target Date: {goal.target_date}
                    </p>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Saved: ₹{Number(goal.current_amount).toFixed(2)}</span>
                      <span>Target: ₹{Number(goal.target_amount).toFixed(2)}</span>
                    </div>

                    <div
                      className="progress mb-2"
                      role="progressbar"
                      aria-valuenow={Math.round(progress)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div
                        className={`progress-bar ${
                          completed ? 'bg-success' : ''
                        }`}
                        style={{ width: `${progress}%` }}
                      >
                        {Math.round(progress)}%
                      </div>
                    </div>

                    <p className="mb-3">
                      {completed
                        ? 'Target achieved!'
                        : `Remaining: ₹${remaining.toFixed(2)}`}
                    </p>

                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(goal)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(goal.id)}
                    >
                      Delete
                    </button>

                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default SavingsGoals;
