import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

const Decisions = () => {
    const { getToken } = useAuth();
    const api = useApi(getToken);

    const [amount, setAmount] = useState('');
    const [decisionType, setDecisionType] = useState('New EMI');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleEvaluate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null); // Clear previous result
        try {
            const payload = {
                decision_type: decisionType,
                amount: parseFloat(amount)
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

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-800 border-slate-700';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'High': return <ShieldAlert className="w-12 h-12 text-red-500" />;
            case 'Moderate': return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
            case 'Low': return <CheckCircle className="w-12 h-12 text-emerald-500" />;
            default: return <Info className="w-12 h-12 text-slate-400" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <header className="text-center space-y-4 mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Risk Engine
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Before you commit to a new expense, let our AI analyze its impact on your financial stability.
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Input Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-xl"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        Decision Parameters
                    </h2>
                    <form onSubmit={handleEvaluate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">Type of Expense</label>
                            <div className="relative">
                                <select
                                    value={decisionType}
                                    onChange={(e) => setDecisionType(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all hover:border-slate-600"
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
                            <label className="block text-sm font-medium mb-2 text-slate-300">Monthly Cost / EMI Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-slate-600"
                                    placeholder="e.g. 500"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading || !amount}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing Financial Impact...
                                </>
                            ) : (
                                <>
                                    Evaluate Risk <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Result Section */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!result && !loading && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20"
                            >
                                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                    <ShieldAlert className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-400 mb-2">Ready to Analyze</h3>
                                <p className="text-slate-500 max-w-xs">
                                    Enter your expense details to get a personalized risk assessment based on your profile.
                                </p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800"
                            >
                                <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldAlert className="w-8 h-8 text-blue-500 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Crunching Numbers...</h3>
                                <p className="text-slate-400">Comparing with your financial profile</p>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className={`h-full rounded-2xl border p-8 flex flex-col ${
                                    result.warning ? 'bg-slate-900 border-blue-500/30' : 
                                    result.risk_level === 'High' ? 'bg-gradient-to-b from-red-950/30 to-slate-950 border-red-500/30' :
                                    result.risk_level === 'Moderate' ? 'bg-gradient-to-b from-yellow-950/30 to-slate-950 border-yellow-500/30' :
                                    'bg-gradient-to-b from-emerald-950/30 to-slate-950 border-emerald-500/30'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Risk Assessment</p>
                                        <h2 className={`text-3xl font-bold ${
                                            result.risk_level === 'High' ? 'text-red-400' :
                                            result.risk_level === 'Moderate' ? 'text-yellow-400' :
                                            result.risk_level === 'Low' ? 'text-emerald-400' :
                                            'text-blue-400'
                                        }`}>
                                            {result.warning ? 'Action Required' : `${result.risk_level} Risk`}
                                        </h2>
                                    </div>
                                    <div className={`p-4 rounded-full bg-slate-950 border-2 ${
                                        result.risk_level === 'High' ? 'border-red-500/50 shadow-lg shadow-red-500/20' :
                                        result.risk_level === 'Moderate' ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' :
                                        result.risk_level === 'Low' ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' :
                                        'border-blue-500/50'
                                    }`}>
                                        {getRiskIcon(result.risk_level)}
                                    </div>
                                </div>

                                {result.warning ? (
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
                                            <p className="text-lg text-blue-200 mb-4">{result.message}</p>
                                            <p className="text-sm text-slate-400">
                                                Please update your financial profile in the <span className="text-white font-medium">Dashboard</span> to get accurate risk assessments.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 flex-1">
                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                <p className="text-xs text-slate-500 uppercase mb-1">Projected DTI</p>
                                                <p className="text-2xl font-bold text-white">
                                                    {result.metrics_at_evaluation?.projected_dti_percentage?.toFixed(1) || 0}%
                                                </p>
                                                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                                    <div 
                                                        className={`h-full ${
                                                            (result.metrics_at_evaluation?.projected_dti_percentage || 0) > 40 ? 'bg-red-500' :
                                                            (result.metrics_at_evaluation?.projected_dti_percentage || 0) > 30 ? 'bg-yellow-500' : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${Math.min(result.metrics_at_evaluation?.projected_dti_percentage || 0, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                <p className="text-xs text-slate-500 uppercase mb-1">New Monthly Commit</p>
                                                <p className="text-2xl font-bold text-white">
                                                    ₹{parseFloat(amount).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* AI Explanation */}
                                        <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 relative">
                                            <div className="absolute -top-3 left-6 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">
                                                AI Analysis
                                            </div>
                                            <p className="text-slate-300 leading-relaxed italic">
                                                "{result.ai_explanation}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Decisions;
