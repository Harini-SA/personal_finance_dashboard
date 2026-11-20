
import { useState, useEffect } from 'react';
import api from '../api';

function Budgets() {
    const [showForm, setShowForm] = useState(false);
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [editingBudgetId, setEditingBudgetId] = useState(null);

    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const fetchBudgets = async () => {
        try {
            const response = await api.get('/budgets/');
            setBudgets(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/');
                setCategories(response.data.results || response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
        fetchBudgets();
    }, []);

    const resetForm = () => {
        setFormData({
            category: '',
            amount: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        });

        setEditingBudgetId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBudgetId) {
                await api.put(`/budgets/${editingBudgetId}/`, formData);
                alert('Budget updated successfully!');
            } else {
                await api.post('/budgets/', formData);
                alert('Budget created successfully!');
            }

            await fetchBudgets();
            resetForm();
        } catch (error) {
            console.error('Error saving budget:', error);

            const errorData = error.response?.data;
            const errorMessage =
                errorData?.detail ||
                Object.values(errorData || {}).flat().join(' ') ||
                'Failed to save budget.';

            alert(errorMessage);
        }
    };

    const handleEdit = (budget) => {
        setEditingBudgetId(budget.id);

        setFormData({
            category: String(budget.category),
            amount: budget.amount,
            month: budget.month,
            year: budget.year,
        });

        setShowForm(true);
    };

    const handleDelete = async (budgetId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this budget?'
        );

        if (!confirmed) return;

        try {
            await api.delete(`/budgets/${budgetId}/`);
            await fetchBudgets();
            alert('Budget deleted successfully!');
        } catch (error) {
            console.error('Error deleting budget:', error);
            alert('Failed to delete budget.');
        }
    };

    const filteredBudgets = budgets.filter((budget) => {
        const matchesMonth =
            selectedMonth === 'all' ||
            Number(budget.month) === Number(selectedMonth);

        const matchesYear =
            selectedYear === 'all' ||
            Number(budget.year) === Number(selectedYear);

        return matchesMonth && matchesYear;
    });

    const availableYears = [
        ...new Set([
            new Date().getFullYear(),
            ...budgets.map((budget) => Number(budget.year)),
        ]),
    ].sort((a, b) => b - a);

    const monthNames = Array.from(
        { length: 12 },
        (_, i) => new Date(2000, i).toLocaleString('en', {
            month: 'long'
        })
    );

    return (
        <div className="budgets-page">

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Monthly Budgets</h2>
                    <p>Plan your spending and stay within your limits.</p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                >
                    + Create Budget
                </button>
            </div>

            {/* Month and Year Filters */}
            <div className="card mt-4">
                <div className="card-body">
                    <div className="row align-items-end">

                        <div className="col-md-5 mb-3 mb-md-0">
                            <label className="form-label">
                                Filter by Month
                            </label>

                            <select
                                className="form-select"
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                }
                            >
                                <option value="all">All Months</option>

                                {monthNames.map((month, index) => (
                                    <option
                                        key={index + 1}
                                        value={index + 1}
                                    >
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-5 mb-3 mb-md-0">
                            <label className="form-label">
                                Filter by Year
                            </label>

                            <select
                                className="form-select"
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                            >
                                <option value="all">All Years</option>

                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setSelectedMonth('all');
                                    setSelectedYear('all');
                                }}
                            >
                                Reset
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="row mt-4">
                {filteredBudgets.map((budget) => {
                    const amount = Number(budget.amount);
                    const spent = Number(budget.spent_amount || 0);
                    const remaining = amount - spent;

                    const percentage = amount > 0
                        ? (spent / amount) * 100
                        : 0;

                    const progressWidth = Math.min(100, percentage);

                    const isExceeded = percentage >= 100;
                    const isNearLimit =
                        percentage >= 80 && !isExceeded;

                    const status = isExceeded
                        ? 'Exceeded'
                        : isNearLimit
                            ? 'Warning'
                            : 'Safe';

                    const statusClass = isExceeded
                        ? 'bg-danger'
                        : isNearLimit
                            ? 'bg-warning text-dark'
                            : 'bg-success';

                    const progressColor = isExceeded
                        ? '#dc3545'
                        : isNearLimit
                            ? '#ffc107'
                            : '#198754';

                    return (
                        <div
                            className="col-md-6 col-lg-4 mb-3"
                            key={budget.id}
                        >
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">

                                    {/* Category and Status */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0">
                                            {budget.category_name}
                                        </h5>

                                        <span className={`badge ${statusClass}`}>
                                            {status}
                                        </span>
                                    </div>

                                    <h3>₹{amount.toFixed(2)}</h3>

                                    <p className="text-muted mb-2">
                                        Monthly Budget
                                    </p>

                                    <p className="text-muted mb-2">
                                        Spent: ₹{spent.toFixed(2)}
                                    </p>

                                    <p
                                        className={
                                            remaining >= 0
                                                ? 'text-success'
                                                : 'text-danger'
                                        }
                                    >
                                        {remaining >= 0
                                            ? `Remaining: ₹${remaining.toFixed(2)}`
                                            : `Exceeded by: ₹${Math.abs(remaining).toFixed(2)}`
                                        }
                                    </p>

                                    {/* Spending Progress Bar */}
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '12px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            marginTop: '12px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${progressWidth}%`,
                                                height: '100%',
                                                backgroundColor: progressColor,
                                                borderRadius: '10px',
                                                transition: 'width 0.3s ease'
                                            }}
                                        ></div>
                                    </div>

                                    <small className="text-muted">
                                        {percentage.toFixed(1)}% used
                                    </small>

                                    {/* Budget Warnings */}
                                    {isExceeded && (
                                        <div className="alert alert-danger mt-3 mb-0">
                                            <strong>Budget exceeded!</strong>
                                            <p className="mb-0">
                                                You have spent more than your monthly budget.
                                            </p>
                                        </div>
                                    )}

                                    {isNearLimit && (
                                        <div className="alert alert-warning mt-3 mb-0">
                                            <strong>Budget warning!</strong>
                                            <p className="mb-0">
                                                You have used at least 80% of your budget.
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-muted mt-3 mb-3">
                                        {monthNames[budget.month - 1]} {budget.year}
                                    </p>

                                    {/* Edit and Delete Buttons */}
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                            onClick={() => handleEdit(budget)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-outline-danger btn-sm flex-fill"
                                            onClick={() => handleDelete(budget.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredBudgets.length === 0 && (
                <p className="text-muted mt-3">
                    No budgets found for the selected month and year.
                </p>
            )}

            {/* Create / Edit Budget Form */}
            {showForm && (
                <div className="card mt-4">
                    <div className="card-body">

                        <h5>
                            {editingBudgetId
                                ? 'Edit Budget'
                                : 'Create New Budget'}
                        </h5>

                        <form onSubmit={handleSubmit}>

                            {/* Category */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Category
                                </label>

                                <select
                                    className="form-select"
                                    value={formData.category}
                                    required
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value
                                        })
                                    }
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Monthly Limit */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Monthly Limit
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter budget amount"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            amount: e.target.value
                                        })
                                    }
                                    min="0.01"
                                    step="any"
                                    required
                                />
                            </div>

                            <div className="row">

                                {/* Month */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Month
                                    </label>

                                    <select
                                        className="form-select"
                                        value={formData.month}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                month: Number(e.target.value)
                                            })
                                        }
                                    >
                                        {monthNames.map((month, index) => (
                                            <option
                                                key={index + 1}
                                                value={index + 1}
                                            >
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Year
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.year}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                year: Number(e.target.value)
                                            })
                                        }
                                        min="2000"
                                        required
                                    />
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary me-2"
                            >
                                {editingBudgetId
                                    ? 'Update Budget'
                                    : 'Save Budget'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Budgets;
