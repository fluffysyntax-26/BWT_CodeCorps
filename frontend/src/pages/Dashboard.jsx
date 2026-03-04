import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useApi } from "../services/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  ShoppingCart,
  PiggyBank,
  Landmark,
  TrendingUp,
  Plus,
  ArrowRight,
  Zap,
  CreditCard,
  Activity,
} from "lucide-react";

// Helper for safe date parsing
const safeDate = (dateStr) => {
  try {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch (e) {
    return new Date();
  }
};

const Dashboard = () => {
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const api = useApi(getToken);

  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    disposableIncome: 0,
    debtToIncome: 0,
    savingsRate: 0,
    recentExpenses: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, expensesRes] = await Promise.all([
        api.getProfile(),
        api.getExpenses(),
      ]);

      let income = 0;
      let currentDebt = 0;
      let totalExpenses = 0;
      let recentExpenses = [];

      if (profileRes.data) {
        income = parseFloat(profileRes.data.monthlyIncome) || 0;
        currentDebt = parseFloat(profileRes.data.currentEmi) || 0;
      }

      if (expensesRes.data && Array.isArray(expensesRes.data)) {
        // Calculate total expenses
        totalExpenses = expensesRes.data.reduce(
          (acc, curr) => acc + (parseFloat(curr?.amount) || 0),
          0,
        );
        // Get last 5 expenses
        recentExpenses = expensesRes.data
          .filter((e) => e) // Filter out nulls
          .sort((a, b) => safeDate(b.date) - safeDate(a.date))
          .slice(0, 5);
      }

      const disposableIncome = income - totalExpenses;
      const debtToIncome = income > 0 ? (currentDebt / income) * 100 : 0;

      // Calculate trends (mock logic for now, could be real historical data)
      const incomeTrend = income > 0 ? "+2%" : "0%";
      const expenseTrend =
        totalExpenses > 0
          ? `${totalExpenses > income * 0.5 ? "+" : "-"}${Math.round((totalExpenses / (income || 1)) * 10)}%`
          : "0%";
      const disposableTrend =
        disposableIncome > 0
          ? `${disposableIncome > income * 0.2 ? "+" : "-"}${Math.round((disposableIncome / (income || 1)) * 5)}%`
          : "0%";
      const dtiTrend =
        debtToIncome > 0
          ? `${debtToIncome < 30 ? "-" : "+"}${Math.round(debtToIncome / 10)}%`
          : "0%";

      setStats({
        income,
        expenses: totalExpenses,
        disposableIncome,
        debtToIncome: debtToIncome.toFixed(1),
        savingsRate: profileRes.data?.targetSavingsRate || 0,
        recentExpenses,
        trends: {
          income: incomeTrend,
          expenses: expenseTrend,
          disposable: disposableTrend,
          dti: dtiTrend,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate a simple health score
  const calculateHealthScore = () => {
    if (stats.income === 0) return 50;
    let score = 80; // Base score

    // Penalize high DTI
    if (stats.debtToIncome > 40) score -= 20;
    else if (stats.debtToIncome > 30) score -= 10;

    // Reward high savings (disposable income ratio)
    const savingsRatio = (stats.disposableIncome / stats.income) * 100;
    if (savingsRatio > 30) score += 15;
    else if (savingsRatio > 20) score += 10;
    else if (savingsRatio < 10) score -= 10;

    return Math.min(Math.max(score, 0), 100);
  };

  const healthScore = calculateHealthScore();
  const scoreColor =
    healthScore >= 80
      ? "text-emerald-500"
      : healthScore >= 60
        ? "text-yellow-500"
        : "text-red-500";
  const scoreStroke =
    healthScore >= 80
      ? "text-emerald-500"
      : healthScore >= 60
        ? "text-yellow-500"
        : "text-red-500";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Hero Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white">
            Financial Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back, {user?.firstName || "User"}. Your financial health is
            looking {healthScore >= 70 ? "great" : "stable"}.
          </p>
        </div>
        <Link
          to="/expenses"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(stats.income)}
          icon={<Wallet className="w-6 h-6" />}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(stats.expenses)}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="text-rose-500"
          bgColor="bg-rose-500/10"
        />
        <SummaryCard
          title="Disposable Income"
          value={formatCurrency(stats.disposableIncome)}
          icon={<PiggyBank className="w-6 h-6" />}
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
        />
        <SummaryCard
          title="Debt-to-Income"
          value={`${stats.debtToIncome}%`}
          icon={<Landmark className="w-6 h-6" />}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Score Visualization */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">
                Financial Health Score
              </h2>
              <p className="text-sm text-slate-400">
                Based on your spending and debt ratio
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold bg-slate-800 ${scoreColor}`}
            >
              {healthScore >= 80
                ? "EXCELLENT"
                : healthScore >= 60
                  ? "STABLE"
                  : "NEEDS ATTENTION"}
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center py-6">
            {/* Circular Gauge */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-slate-800 stroke-current"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  strokeWidth="8"
                ></circle>
                <motion.circle
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{
                    strokeDashoffset: 251.2 - (251.2 * healthScore) / 100,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`${scoreStroke} stroke-current`}
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  strokeDasharray="251.2"
                  strokeLinecap="round"
                  strokeWidth="8"
                ></motion.circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white">
                  {healthScore}
                </span>
                <span className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">
                  Points
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12 w-full max-w-md text-center">
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">
                  Risk Level
                </p>
                <p
                  className={`font-bold ${stats.debtToIncome > 40 ? "text-red-500" : "text-emerald-500"}`}
                >
                  {stats.debtToIncome > 40 ? "High" : "Low"}
                </p>
              </div>
              <div className="border-x border-slate-800">
                <p className="text-slate-500 text-xs font-medium mb-1">
                  Liquidity
                </p>
                <p className="text-white font-bold">
                  {stats.disposableIncome > 0 ? "Good" : "Tight"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">Trend</p>
                <div className="flex items-center justify-center text-blue-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="font-bold">Stable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Expenses</h3>
            <Link
              to="/expenses"
              className="text-blue-500 text-xs font-bold hover:underline"
            >
              View All
            </Link>
          </div>

          {stats.recentExpenses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <ShoppingCart className="w-10 h-10 opacity-20" />
              <p className="text-sm">No expenses recorded yet.</p>
              <Link
                to="/expenses"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Add your first expense
              </Link>
            </div>
          ) : (
            <div className="space-y-5 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {stats.recentExpenses.map((exp, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {exp.title || exp.description || "Expense"}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      {safeDate(exp.date || exp.created_at).toLocaleDateString(
                        "en-IN",
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white">
                    -₹{(parseFloat(exp.amount) || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-6">
            <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10">
              <div className="flex items-start gap-3">
                <Zap className="text-blue-500 w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white mb-1">
                    Safety Insight
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stats.disposableIncome < 0
                      ? "You're spending more than you earn. Review your expenses immediately."
                      : "You're maintaining a healthy balance. Consider increasing your savings rate."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Activity size={160} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-black mb-2">Evaluate a New Decision</h3>
          <p className="text-blue-100/80 mb-6 font-medium">
            Thinking about a big purchase or a life change? Let FinGuard analyze
            the impact on your long-term stability using our AI risk engine.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/decisions"
              className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Analysis
            </Link>
            <Link
              to="/chat"
              className="px-6 py-3 bg-blue-800/30 text-white font-bold rounded-xl backdrop-blur-sm hover:bg-blue-800/40 transition-colors border border-white/20"
            >
              Ask AI Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon,
  color,
  bgColor,
}) => (
  <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`${color} ${bgColor} p-2 rounded-lg`}>{icon}</div>
    </div>
    <p className="text-slate-400 text-sm font-medium">{title}</p>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);

const getCategoryIcon = (category) => {
  switch (category) {
    case "Food & Groceries":
      return <ShoppingCart className="w-5 h-5" />;
    case "Transport":
      return <Zap className="w-5 h-5" />; // Car icon would be better but using Zap for generic
    case "Utilities & Bills":
      return <Zap className="w-5 h-5" />;
    case "Healthcare":
      return <Activity className="w-5 h-5" />;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
};

export default Dashboard;
