import { useState, useEffect } from 'react';
import api from '../api';

function Transactions({ onAccountsUpdate }) { 
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const initialForm = {
        account: '',
        category: '',
        amount: '',
        type: 'expense',
        note: '',
        date: new Date().toLocaleDateString('en-CA'),
    };

    const [formData, setFormData] = useState(initialForm);

    // Fetch Transactions
    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions/');
            setTransactions(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    // Fetch Categories and Accounts
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [categoryResponse, accountResponse] =
                    await Promise.all([
                        api.get('/categories/'),
                        api.get('/accounts/'),
                    ]);

                setCategories(
                    categoryResponse.data.results || categoryResponse.data
                );

                setAccounts(
                    accountResponse.data.results || accountResponse.data
                );
            } catch (error) {
                console.error('Error fetching categories/accounts:', error);
            }
        };

        fetchDropdownData();
        fetchTransactions();
    }, []);

    // Reset Form
    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setShowForm(false);
    };

    // Create or Update Transaction
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                account: Number(formData.account),
                category: formData.category
                    ? Number(formData.category)
                    : null,
            };

            if (editingId) {
                await api.put(`/transactions/${editingId}/`, payload);
                alert('Transaction updated successfully!');
            } else {
                await api.post('/transactions/', payload);
                alert('Transaction created successfully!');
            }

            await fetchTransactions();
            await onAccountsUpdate?.(); 
            resetForm();
        } catch (error) {
            console.error('Error saving transaction:', error);

            const errorData = error.response?.data;
            const message =
                errorData?.detail ||
                Object.values(errorData || {}).flat().join(' ') ||
                'Failed to save transaction.';

            alert(message);
        }
    };

    // Edit Transaction
    const handleEdit = (transaction) => {
        setEditingId(transaction.id);

        setFormData({
            account: String(transaction.account),
            category: transaction.category
                ? String(transaction.category)
                : '',
            amount: transaction.amount,
            type: transaction.type,
            note: transaction.note || '',
            date: transaction.date,
        });

        setShowForm(true);
    };

    // Filter Transactions by Date
    const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = transaction.date;

        const matchesStartDate =
            !startDate || transactionDate >= startDate;

        const matchesEndDate =
            !endDate || transactionDate <= endDate;

        return matchesStartDate && matchesEndDate;
    });

    // Export CSV
    const exportCSV = () => {
        if (filteredTransactions.length === 0) {
            alert('No transactions available to export.');
            return;
        }

        const headers = [
            'Date',
            'Type',
            'Category',
            'Account',
            'Amount',
            'Note',
        ];

        const escapeCSV = (value) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`;

        const rows = filteredTransactions.map((transaction) => [
            transaction.date,
            transaction.type,
            transaction.category_name || 'Uncategorized',
            transaction.account_name || '',
            transaction.amount,
            transaction.note || '',
        ]);

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map((row) => row.map(escapeCSV).join(',')),
        ].join('\n');

        const blob = new Blob(
            ['\uFEFF' + csvContent],
            { type: 'text/csv;charset=utf-8;' }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'transactions.csv';
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="transactions-page">

            {/* Header */}
            <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2>Transactions</h2>
                    <p>Manage your income and expenses.</p>
                </div>

                <button
                    className="btn btn-primary px-4"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                >
                    + Add Transaction
                </button>
            </div>

            {/* Date Filters */}
            <div className="card mt-4">
                <div className="card-body">
                    <h5>Filter Transactions</h5>

                    <div className="row g-4 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label">
                                Start Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">
                                End Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-2">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                }}
                            >
                                Reset
                            </button>
                        </div>

                        <div className="col-md-2">
                            <button
                                className="btn btn-success w-100"
                                onClick={exportCSV}
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create / Edit Form */}
            {showForm && (
                <div className="card mt-4">
                    <div className="card-body">
                        <h5>
                            {editingId
                                ? 'Edit Transaction'
                                : 'Add New Transaction'}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Transaction Type
                                    </label>

                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                type: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Amount
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.amount}
                                        min="0.01"
                                        step="any"
                                        required
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                amount: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Account
                                    </label>

                                    <select
                                        className="form-select"
                                        value={formData.account}
                                        required
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                account: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            Select Account
                                        </option>

                                        {accounts.map((account) => (
                                            <option
                                                key={account.id}
                                                value={account.id}
                                            >
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Category
                                    </label>

                                    <select
                                        className="form-select"
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                category: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            Select Category
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

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.date}
                                        required
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Note
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter transaction note"
                                        value={formData.note}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                note: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Form Buttons */}
                            <div className="d-flex flex-wrap gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4"
                                >
                                    {editingId
                                        ? 'Update Transaction'
                                        : 'Save Transaction'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary px-4"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction Table */}
            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="mb-3">Transaction History</h5>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th>Account</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.date}</td>

                                        <td>
                                            <span
                                                className={`badge ${
                                                    transaction.type === 'income'
                                                        ? 'bg-success'
                                                        : 'bg-danger'
                                                }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </td>

                                        <td>
                                            {transaction.category_name ||
                                                'Uncategorized'}
                                        </td>

                                        <td>
                                            {transaction.account_name || '-'}
                                        </td>

                                        <td>
                                            ₹{Number(
                                                transaction.amount
                                            ).toFixed(2)}
                                        </td>

                                        <td>{transaction.note || '-'}</td>

                                        <td>
                                            
                                            <button
                                                className="btn btn-sm btn-outline-primary px-3"
                                                onClick={() =>
                                                    handleEdit(transaction)
                                                }
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center text-muted py-4"
                                        >
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-muted mb-0">
                        Showing {filteredTransactions.length} of{' '}
                        {transactions.length} transactions
                    </p>
                </div>
            </div>

        </div>
    );
}

export default Transactions;
