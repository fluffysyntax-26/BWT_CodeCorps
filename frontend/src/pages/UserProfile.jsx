import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useApi } from '../services/api';
import { motion } from 'framer-motion';
import { 
    Save, 
    IndianRupee, 
    CreditCard, 
    Wallet, 
    ShoppingCart, 
    PiggyBank, 
    Info, 
    Trash2,
    Edit2
} from 'lucide-react';

const UserProfile = () => {
    const { getToken, isLoaded } = useAuth();
    const { user } = useUser();
    const api = useApi(getToken);

    const [profile, setProfile] = useState({
        monthlyIncome: '',
        fixedExpenses: '',
        currentEmi: '',
        currentSavings: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            fetchData();
        }
    }, [isLoaded]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const profileRes = await api.getProfile();
            if (profileRes.data) {
                const data = profileRes.data;
                setProfile({
                    monthlyIncome: data.monthlyIncome !== undefined && data.monthlyIncome !== null ? String(data.monthlyIncome) : '',
                    fixedExpenses: data.fixedExpenses !== undefined && data.fixedExpenses !== null ? String(data.fixedExpenses) : '',
                    currentEmi: data.currentEmi !== undefined && data.currentEmi !== null ? String(data.currentEmi) : '',
                    currentSavings: data.currentSavings !== undefined && data.currentSavings !== null ? String(data.currentSavings) : '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        setProfileError('');
        setSuccessMessage('');
    };

    const validateProfile = () => {
        const income = parseFloat(profile.monthlyIncome);
        if (profile.monthlyIncome && (isNaN(income) || income < 0)) return 'Please enter a valid monthly income';
        
        const expenses = parseFloat(profile.fixedExpenses);
        if (profile.fixedExpenses && (isNaN(expenses) || expenses < 0)) return 'Please enter valid fixed expenses';

        const emi = parseFloat(profile.currentEmi);
        if (profile.currentEmi && (isNaN(emi) || emi < 0)) return 'Please enter valid EMI amount';

        const savings = parseFloat(profile.currentSavings);
        if (profile.currentSavings && (isNaN(savings) || savings < 0)) return 'Please enter valid current savings';

        return null;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateProfile();
        if (validationError) {
            setProfileError(validationError);
            return;
        }

        setIsSaving(true);
        try {
            const profileData = {
                monthly_income: parseFloat(profile.monthlyIncome) || 0,
                fixed_expenses: parseFloat(profile.fixedExpenses) || 0,
                current_debt: parseFloat(profile.currentEmi) || 0,
                current_savings: parseFloat(profile.currentSavings) || 0,
                savings_rate: 0, 
            };

            const res = await api.updateProfile(profileData);

            if (res.data) {
                setSuccessMessage('Profile updated successfully!');
                // Wait a bit then clear success message
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setProfileError('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset your financial data? This action cannot be undone.')) {
            return;
        }

        setIsResetting(true);
        try {
            await api.resetProfile();
            setProfile({
                monthlyIncome: '',
                fixedExpenses: '',
                currentEmi: '',
                currentSavings: '',
            });
            setSuccessMessage('Financial data reset successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error resetting profile:', error);
            setProfileError('Failed to reset profile.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleDiscard = () => {
        if (window.confirm('Discard unsaved changes?')) {
            fetchData();
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center text-slate-400">Loading profile...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            {/* User Information Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm"
            >
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">User Information</h2>
                    <p className="text-slate-400 text-sm">Manage your personal details and how we contact you.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center text-3xl font-bold text-blue-500 border-2 border-blue-500/30 overflow-hidden">
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.firstName?.[0] || 'U'}</span>
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 w-full">
                         <div className="mb-6">
                            <h3 className="font-semibold text-white text-lg">{user?.fullName || 'User'}</h3>
                            <span className="text-xs text-slate-500">Premium Member since Jan 2024</span>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Full Name</label>
                                <input 
                                    type="text" 
                                    value={user?.fullName || ''} 
                                    disabled 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <input 
                                    type="text" 
                                    value={user?.primaryEmailAddress?.emailAddress || ''} 
                                    disabled 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                         </div>
                    </div>
                </div>
            </motion.div>

            {/* Core Financial Data Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm"
            >
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Core Financial Data</h2>
                    <p className="text-slate-400 text-sm">Our metrics engine uses this data to calculate your financial health score.</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monthly Income */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                <Wallet className="w-4 h-4 text-blue-500" /> Monthly Income
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500 font-semibold">$</span>
                                <input
                                    type="number"
                                    name="monthlyIncome"
                                    value={profile.monthlyIncome}
                                    onChange={handleProfileChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-8 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-lg"
                                    placeholder="8500"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Include all net post-tax income sources.</p>
                        </div>

                        {/* Fixed Expenses */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                <ShoppingCart className="w-4 h-4 text-orange-500" /> Fixed Expenses
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500 font-semibold">$</span>
                                <input
                                    type="number"
                                    name="fixedExpenses"
                                    value={profile.fixedExpenses}
                                    onChange={handleProfileChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-8 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-lg"
                                    placeholder="3200"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Rent, Utilities, Groceries, Insurance.</p>
                        </div>

                        {/* Existing EMIs */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                <CreditCard className="w-4 h-4 text-red-500" /> Existing EMIs
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500 font-semibold">$</span>
                                <input
                                    type="number"
                                    name="currentEmi"
                                    value={profile.currentEmi}
                                    onChange={handleProfileChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-8 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-lg"
                                    placeholder="1200"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Loans, Credit Cards, Car Lease.</p>
                        </div>

                        {/* Current Savings */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                <PiggyBank className="w-4 h-4 text-green-500" /> Current Savings
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500 font-semibold">$</span>
                                <input
                                    type="number"
                                    name="currentSavings"
                                    value={profile.currentSavings}
                                    onChange={handleProfileChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-8 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-lg"
                                    placeholder="45000"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Liquid cash, Emergency fund, Deposits.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded-lg flex gap-3 items-start">
                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-200">
                            Updating these values will trigger a full re-calculation of your <span className="font-semibold text-blue-100">Financial Freedom Score</span>. This might take up to a minute to reflect in your dashboard.
                        </p>
                    </div>

                    {profileError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {profileError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-2 border-t border-slate-800">
                        <button 
                            type="button"
                            onClick={handleDiscard}
                            className="px-6 py-2.5 text-slate-400 hover:text-white font-medium transition-colors"
                        >
                            Discard Changes
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Danger Zone */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-950/10 border border-red-900/20 rounded-xl p-6"
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
                    <p className="text-red-400/70 text-sm">Irreversible actions regarding your account and data.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-950/20 rounded-lg border border-red-900/20">
                    <div>
                        <h3 className="font-semibold text-white">Reset Financial Data</h3>
                        <p className="text-sm text-slate-400">Wipe all EMIs and expense history to start over.</p>
                    </div>
                    <button 
                        onClick={handleReset}
                        disabled={isResetting}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-medium disabled:opacity-50"
                    >
                        {isResetting ? (
                            <span className="animate-spin">⌛</span>
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Reset Data
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default UserProfile;
