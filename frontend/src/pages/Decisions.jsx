import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, 
    CheckCircle, 
    Info, 
    ShieldAlert, 
    Loader2, 
    Zap,
    TrendingUp,
    Clock,
    DollarSign,
    IndianRupee,
    Share2,
    Save
} from 'lucide-react';

const Decisions = () => {
    const { getToken } = useAuth();
    const api = useApi(getToken);

    const [formData, setFormData] = useState({
        amount: '',
        decisionType: 'New EMI',
        interestRate: '10.5',
        duration: '12'
    });
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEvaluate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const payload = {
                decision_type: formData.decisionType,
                amount: parseFloat(formData.amount),
                interest_rate: parseFloat(formData.interestRate),
                duration_months: parseInt(formData.duration)
            };
            const res = await api.evaluateDecision(payload);
            setResult(res.data);
        } catch (err) {
            console.error("Evaluation failed", err);
            setResult({
                warning: true,
                message: "Something went wrong. Please try again later.",
                risk_level: "Error"
            });
        } finally {
            setLoading(false);
        }
    };

    const getRiskBadgeColor = (level) => {
        switch (level) {
            case 'High': return 'bg-red-500 text-white';
            case 'Moderate': return 'bg-orange-500 text-white';
            case 'Low': return 'bg-emerald-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getRiskTextColor = (level) => {
        switch (level) {
            case 'High': return 'text-red-400';
            case 'Moderate': return 'text-orange-400';
            case 'Low': return 'text-emerald-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Evaluate Decision</h1>
                <p className="text-slate-400">Assess the long-term impact of your next major financial commitment.</p>
            </header>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Input Section - Left Column */}
                <div className="lg:col-span-5 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-500" />
                            </div>
                            Decision Details
                        </h2>
                        
                        <form onSubmit={handleEvaluate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Decision Type</label>
                                <div className="relative">
                                    <select
                                        name="decisionType"
                                        value={formData.decisionType}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all font-medium"
                                    >
                                        <option value="New EMI">New EMI (Loan/Financing)</option>
                                        <option value="Vehicle Loan">Vehicle Loan</option>
                                        <option value="Medical Emergency">Medical Emergency</option>
                                        <option value="Major Purchase">Major Purchase</option>
                                        <option value="Education Loan">Education Loan</option>
                                        <option value="Home Renovation">Home Renovation</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Total Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-500"
                                    placeholder="e.g. 150000"
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        name="interestRate"
                                        value={formData.interestRate}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                        placeholder="10.5"
                                        step="0.1"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Duration (Months)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                        placeholder="24"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading || !formData.amount}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Running Analysis...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-5 h-5" />
                                        Run AI Evaluation
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-200 leading-relaxed">
                            This evaluation uses your current profile data (Income, Savings, Debt) to calculate potential risk scores and financial impact.
                        </p>
                    </div>
                </div>

                {/* Result Section - Right Column */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {!result && !loading && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20"
                            >
                                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                    <TrendingUp className="w-12 h-12 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-300 mb-2">Ready to Evaluate</h3>
                                <p className="text-slate-500 max-w-sm">
                                    Fill in the decision details on the left to generate a comprehensive AI risk analysis.
                                </p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 shadow-xl"
                            >
                                <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Analyzing Financial Impact...</h3>
                                <p className="text-slate-500">Calculating risk metrics and generating insights</p>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800"
                            >
                                {/* Header */}
                                <div className="bg-slate-950/50 px-8 py-6 border-b border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                                        <span className="font-bold text-orange-400 tracking-wide text-sm uppercase">Evaluation Result</span>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getRiskBadgeColor(result.risk_level)}`}>
                                        {result.risk_level} Risk
                                    </span>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* AI Analysis */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-3">AI Analysis</h3>
                                        <p className="text-slate-300 leading-relaxed">
                                            {result.warning ? result.message : 
                                                <>
                                                    Based on your current debt-to-income ratio and the requested amount of 
                                                    <span className="font-semibold text-white"> ₹{parseFloat(formData.amount).toLocaleString()}</span>, 
                                                    this decision carries a <span className={`font-bold ${getRiskTextColor(result.risk_level)}`}>{result.risk_level.toLowerCase()} risk</span>. 
                                                    {result.ai_explanation}
                                                </>
                                            }
                                        </p>
                                    </div>

                                    {!result.warning && (
                                        <>
                                            {/* Metrics Progress Bars */}
                                            <div className="space-y-6">
                                                {/* EMI Impact */}
                                                <div>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className="text-sm font-semibold text-slate-300">Proposed EMI Impact</span>
                                                        <span className="text-sm font-bold text-blue-500">{result.metrics_at_evaluation?.new_emi_impact_percentage}% of Net Income</span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                                                            style={{ width: `${Math.min(result.metrics_at_evaluation?.new_emi_impact_percentage || 0, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-1 text-xs text-slate-500 font-medium">
                                                        <span>Safe (&lt; 15%)</span>
                                                        <span>Critical (&gt; 40%)</span>
                                                    </div>
                                                </div>

                                                {/* Emergency Fund Coverage */}
                                                <div>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className="text-sm font-semibold text-slate-300">Emergency Fund Coverage</span>
                                                        <span className={`text-sm font-bold ${
                                                            (result.metrics_at_evaluation?.emergency_fund_months || 0) < 3 ? 'text-red-500' : 'text-emerald-500'
                                                        }`}>
                                                            {result.metrics_at_evaluation?.emergency_fund_months} Months
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                                (result.metrics_at_evaluation?.emergency_fund_months || 0) < 3 ? 'bg-red-500' : 
                                                                (result.metrics_at_evaluation?.emergency_fund_months || 0) < 6 ? 'bg-yellow-500' : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${Math.min(((result.metrics_at_evaluation?.emergency_fund_months || 0) / 6) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-1 text-xs text-slate-500 font-medium">
                                                        <span>Min: 3 Mo</span>
                                                        <span>Ideal: 6 Mo</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recommendations */}
                                            {result.recommendations && result.recommendations.length > 0 && (
                                                <div className="pt-2">
                                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        AI Safety Recommendations
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {result.recommendations.map((rec, index) => (
                                                            <li key={index} className="flex gap-3 text-slate-300 text-sm items-start">
                                                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                                                <span>{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="bg-slate-950 px-8 py-4 border-t border-slate-800 flex gap-4">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors shadow-sm">
                                        <Save className="w-4 h-4" />
                                        Save Evaluation
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors shadow-sm">
                                        <Share2 className="w-4 h-4" />
                                        Export Report
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Decisions;
