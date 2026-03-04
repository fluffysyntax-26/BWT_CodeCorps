import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useApi } from '../services/api';
import { motion } from 'framer-motion';
import { Save, IndianRupee, TrendingUp, CreditCard } from 'lucide-react';

const UserProfile = () => {
    const { getToken, isLoaded } = useAuth();
    const { user } = useUser();
    const api = useApi(getToken);

    const [profile, setProfile] = useState({
        monthlyIncome: '',
        currentEmi: '',
        targetSavingsRate: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
                    currentEmi: data.currentEmi !== undefined && data.currentEmi !== null ? String(data.currentEmi) : '',
                    targetSavingsRate: data.targetSavingsRate !== undefined && data.targetSavingsRate !== null ? String(data.targetSavingsRate) : ''
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
        const emi = parseFloat(profile.currentEmi);
        const savings = parseFloat(profile.targetSavingsRate);

        if (isNaN(income) || income <= 0) {
            return 'Please enter a valid monthly income greater than 0';
        }
        if (isNaN(emi) || emi < 0) {
            return 'Please enter a valid EMI amount (0 or greater)';
        }
        if (isNaN(savings) || savings < 0 || savings > 100) {
            return 'Please enter a valid savings rate (0-100%)';
        }
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
                monthly_income: parseFloat(profile.monthlyIncome),
                current_debt: parseFloat(profile.currentEmi),
                savings_rate: parseFloat(profile.targetSavingsRate)
            };

            const res = await api.updateProfile(profileData);

            if (res.data) {
                const data = res.data;
                setProfile({
                    monthlyIncome: data.monthlyIncome !== undefined && data.monthlyIncome !== null ? String(data.monthlyIncome) : profile.monthlyIncome,
                    currentEmi: data.currentEmi !== undefined && data.currentEmi !== null ? String(data.currentEmi) : profile.currentEmi,
                    targetSavingsRate: data.targetSavingsRate !== undefined && data.targetSavingsRate !== null ? String(data.targetSavingsRate) : profile.targetSavingsRate
                });
                setSuccessMessage('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setProfileError('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center text-slate-400">Loading profile...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-slate-400">Manage your financial details and goals.</p>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-2xl font-bold text-blue-500 border border-blue-500/30">
                        {user?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{user?.fullName || 'User'}</h2>
                        <p className="text-slate-400 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <IndianRupee className="w-4 h-4 text-green-500" /> Monthly Income
                            </label>
                            <input
                                type="number"
                                name="monthlyIncome"
                                value={profile.monthlyIncome}
                                onChange={handleProfileChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="5000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <CreditCard className="w-4 h-4 text-red-500" /> Monthly Debt / EMI
                            </label>
                            <input
                                type="number"
                                name="currentEmi"
                                value={profile.currentEmi}
                                onChange={handleProfileChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="1000"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <TrendingUp className="w-4 h-4 text-blue-500" /> Target Savings Rate (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="targetSavingsRate"
                                    value={profile.targetSavingsRate}
                                    onChange={handleProfileChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="20"
                                    min="0"
                                    max="100"
                                />
                                <div className="absolute right-3 top-3 text-slate-500">%</div>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${Math.min(parseFloat(profile.targetSavingsRate) || 0, 100)}%` }}
                                />
                            </div>
                        </div>
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

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UserProfile;
