import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Trash2, 
    PieChart, 
    IndianRupee, 
    Calendar,
    Wallet,
    TrendingUp,
    ShoppingBag
} from 'lucide-react';

const ExpenseTracker = () => {
    const { getToken, isLoaded } = useAuth();
    const api = useApi(getToken);

    const [expenses, setExpenses] = useState([]);
    const [balance, setBalance] = useState(0);
    const [monthlySpending, setMonthlySpending] = useState(0);
    const [highestCategory, setHighestCategory] = useState({ name: 'None', percentage: 0 });
    
    const [newExpense, setNewExpense] = useState({
        title: '',
        amount: '',
        category: 'Food & Groceries',
        date: new Date().toISOString().split('T')[0]
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [expenseError, setExpenseError] = useState('');

    useEffect(() => {
        if (isLoaded) {
            fetchData();
        }
    }, [isLoaded]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [expensesRes, profileRes] = await Promise.all([
                api.getExpenses(),
                api.getProfile()
            ]);
            
            let currentExpenses = [];
            if (expensesRes.data) {
                currentExpenses = expensesRes.data.map(exp => ({
                    ...exp,
                    title: exp.title || exp.description || '',
                    date: exp.date ? new Date(exp.date) : new Date(exp.created_at || Date.now())
                })).sort((a, b) => b.date - a.date); // Sort by date descending
                setExpenses(currentExpenses);
            }

            // Calculate Metrics
            const totalExpenses = currentExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
            
            // Monthly Spending (Current Month)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const thisMonthExpenses = currentExpenses.filter(exp => 
                exp.date.getMonth() === currentMonth && 
                exp.date.getFullYear() === currentYear
            );
            const monthSpend = thisMonthExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
            setMonthlySpending(monthSpend);

            // Highest Category
            const categoryTotals = {};
            currentExpenses.forEach(exp => {
                const amount = parseFloat(exp.amount || 0);
                categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amount;
            });
            let maxCat = 'None';
            let maxVal = 0;
            for (const [cat, val] of Object.entries(categoryTotals)) {
                if (val > maxVal) {
                    maxVal = val;
                    maxCat = cat;
                }
            }
            const percentage = totalExpenses > 0 ? Math.round((maxVal / totalExpenses) * 100) : 0;
            setHighestCategory({ name: maxCat, percentage });

            if (profileRes.data) {
                const income = parseFloat(profileRes.data.monthlyIncome) || 0;
                setBalance(income - totalExpenses);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExpenseChange = (e) => {
        setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
        setExpenseError('');
    };

    const setDateToToday = () => {
        setNewExpense({ ...newExpense, date: new Date().toISOString().split('T')[0] });
    };

    const validateExpense = () => {
        const amount = parseFloat(newExpense.amount);
        if (!newExpense.title.trim()) {
            return 'Please enter a title for the expense';
        }
        if (isNaN(amount) || amount <= 0) {
            return 'Please enter a valid amount greater than 0';
        }
        if (!newExpense.date) {
            return 'Please select a date';
        }
        return null;
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateExpense();
        if (validationError) {
            setExpenseError(validationError);
            return;
        }

        try {
            const expenseData = {
                amount: parseFloat(newExpense.amount),
                category: newExpense.category,
                title: newExpense.title,
                description: newExpense.title,
                date: new Date(newExpense.date).toISOString()
            };

            const res = await api.addExpense(expenseData);

            if (res.data) {
                const newExp = {
                    ...res.data,
                    title: res.data.title || newExpense.title,
                    amount: res.data.amount || newExpense.amount,
                    category: res.data.category || newExpense.category,
                    date: new Date(res.data.date || newExpense.date)
                };
                
                const updatedExpenses = [newExp, ...expenses].sort((a, b) => b.date - a.date);
                setExpenses(updatedExpenses);
                
                // Update metrics locally for instant feedback
                const amount = parseFloat(newExp.amount);
                setBalance(prev => prev - amount);
                
                const expDate = new Date(newExp.date);
                if (expDate.getMonth() === new Date().getMonth() && expDate.getFullYear() === new Date().getFullYear()) {
                    setMonthlySpending(prev => prev + amount);
                }

                setNewExpense({ 
                    title: '', 
                    amount: '', 
                    category: 'Food & Groceries',
                    date: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            setExpenseError('Failed to add expense. Please try again.');
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }
        try {
            const expenseToDelete = expenses.find(exp => exp.id === id || exp._id === id);
            await api.deleteExpense(id);
            setExpenses(expenses.filter(exp => exp.id !== id && exp._id !== id));
            
            if (expenseToDelete) {
                const amount = parseFloat(expenseToDelete.amount);
                setBalance(prev => prev + amount);
                
                const expDate = new Date(expenseToDelete.date);
                if (expDate.getMonth() === new Date().getMonth() && expDate.getFullYear() === new Date().getFullYear()) {
                    setMonthlySpending(prev => prev - amount);
                }
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const categories = [
        'Food & Groceries',
        'Transport',
        'Utilities & Bills',
        'Entertainment',
        'Healthcare',
        'Shopping',
        'Other'
    ];

    const getCategoryColor = (cat) => {
        switch(cat) {
            case 'Food & Groceries': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Housing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Transport': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Utilities & Bills': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'Healthcare': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Monthly Spending</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            ₹{monthlySpending.toLocaleString('en-IN')}
                        </h2>
                        {/* <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">+12% vs last month</span> */}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Highest Category</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {highestCategory.name}
                        </h2>
                        <span className="text-slate-400 text-sm">{highestCategory.percentage}% of total</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Budget Remaining (Balance)</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            ₹{balance.toLocaleString('en-IN')}
                        </h2>
                        {/* <span className="text-slate-400 text-sm">of ₹40,000.00</span> */}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                        <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                        {isLoading ? (
                            <div className="p-10 text-center text-slate-500">Loading transactions...</div>
                        ) : expenses.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                                <Wallet className="w-12 h-12 mb-3 opacity-20" />
                                <p>No transactions yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 text-xs uppercase text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {expenses.map((exp) => (
                                        <tr key={exp.id || exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {exp.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryColor(exp.category)}`}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {exp.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right font-mono">
                                                ₹{parseFloat(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteExpense(exp.id || exp._id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Add Expense Form */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-fit sticky top-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Add Expense</h3>
                    <form onSubmit={handleExpenseSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input 
                                    type="number" 
                                    name="amount"
                                    value={newExpense.amount}
                                    onChange={handleExpenseChange}
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-8 pr-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                            <select 
                                name="category"
                                value={newExpense.category}
                                onChange={handleExpenseChange}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="date" 
                                        name="date"
                                        value={newExpense.date}
                                        onChange={handleExpenseChange}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                    {/* <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" /> */}
                                </div>
                                <button 
                                    type="button"
                                    onClick={setDateToToday}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Today
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                            <input 
                                type="text" 
                                name="title"
                                value={newExpense.title}
                                onChange={handleExpenseChange}
                                placeholder="e.g. Weekly Groceries"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {expenseError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-lg">
                                {expenseError}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98]"
                        >
                            Add Expense
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTracker;
