import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { LogOut, DollarSign, Package, Plus, Eye, Calendar, CreditCard, Receipt, User, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useAuth } from '@/contexts/AuthContext';
import {
    SalesService, ProductService, ExpenseService, PurchaseService, CreditorService
} from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/db';

// Schemas for expenses and purchases
const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
});

const purchaseSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  cost: z.number().min(0.01, 'Cost must be greater than 0'),
  supplier: z.string().min(1, 'Supplier is required'),
  date: z.string().min(1, 'Date is required'),
});

const creditorSchema = z.object({
  name: z.string().min(1, 'Creditor name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  reminderDate: z.string().min(1, 'Reminder date is required'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;
type PurchaseFormData = z.infer<typeof purchaseSchema>;
type CreditorFormData = z.infer<typeof creditorSchema>;

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Purchase {
  id: string;
  productName: string;
  quantity: number;
  cost: number;
  supplier: string | null;
  date: string;
}

interface Creditor {
  id: string;
  name: string;
  amount: number;
  description: string;
  dueDate: string;
  reminderDate: string;
  isPaid: boolean;
}

const AdminMain: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    totalIncome: 0,
  });
  
  // State for expenses, purchases, and creditors
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [isAddCreditorOpen, setIsAddCreditorOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Form hooks
  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      productName: '',
      quantity: 1,
      cost: 0,
      supplier: '',
      date: new Date().toISOString().split('T')[0],
    },
  });
  
  const creditorForm = useForm<CreditorFormData>({
    resolver: zodResolver(creditorSchema),
    defaultValues: {
      name: '',
      amount: 0,
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      reminderDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleTutorialClick = () => {
    // Tutorial functionality - can be expanded later
    console.log('Tutorial started');
  };

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      await ExpenseService.addExpense({
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: new Date(data.date),
      });
      setIsAddExpenseOpen(false);
      expenseForm.reset();
      toast({
        title: 'Expense Added',
        description: `${data.description} has been added`,
      });
      loadFinancialData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const handleAddPurchase = async (data: PurchaseFormData) => {
    try {
      await PurchaseService.addPurchase({
        productName: data.productName,
        quantity: data.quantity,
        cost: data.cost,
        supplier: data.supplier || null,
        date: new Date(data.date),
        description: null,
        details: null,
        expirationDate: null,
      });
      setIsAddPurchaseOpen(false);
      purchaseForm.reset();
      toast({
        title: 'Purchase Added',
        description: `${data.productName} has been added`,
      });
      loadFinancialData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add purchase',
        variant: 'destructive',
      });
    }
  };
  
  const handleAddCreditor = async (data: CreditorFormData) => {
    try {
      await CreditorService.addCreditor({
        name: data.name,
        amount: data.amount,
        description: data.description,
        dueDate: new Date(data.dueDate),
        reminderDate: new Date(data.reminderDate),
        isPaid: false,
      });
      setIsAddCreditorOpen(false);
      creditorForm.reset();
      toast({
        title: 'Creditor Added',
        description: `${data.name} has been added to the ledger`,
      });
      loadFinancialData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add creditor',
        variant: 'destructive',
      });
    }
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
    });
  };

  const getFilteredPurchases = () => {
    return purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.date);
      return purchaseDate.getMonth() === selectedMonth && purchaseDate.getFullYear() === selectedYear;
    });
  };
  
  const getFilteredCreditors = () => {
    return creditors.filter(creditor => {
      const dueDate = new Date(creditor.dueDate);
      return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;
    });
  };
  
  const getUpcomingPayments = () => {
    const today = new Date();
    return creditors.filter(creditor => {
      if (creditor.isPaid) return false;
      const dueDate = new Date(creditor.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7; // Due within a week
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  const loadFinancialData = async () => {
    try {
      const [expensesData, purchasesData, creditorsData] = await Promise.all([
        ExpenseService.getAllExpenses(),
        PurchaseService.getAllPurchases(),
        CreditorService.getAllCreditors(),
      ]);
      setExpenses(expensesData.map(e => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        category: e.category,
        date: (e.date instanceof Date ? e.date : new Date(e.date ?? Date.now())).toISOString().split('T')[0],
      })));
      setPurchases(purchasesData.map(p => ({
        id: p.id,
        productName: p.productName,
        quantity: p.quantity,
        cost: p.cost,
        supplier: p.supplier ?? null,
        date: (p.date instanceof Date ? p.date : new Date(p.date ?? Date.now())).toISOString().split('T')[0],
      })));
      setCreditors(creditorsData.map(c => ({
        id: c.id,
        name: c.name,
        amount: c.amount,
        description: c.description ?? '',
        dueDate: (c.dueDate instanceof Date ? c.dueDate : new Date(c.dueDate ?? Date.now())).toISOString().split('T')[0],
        reminderDate: (c.reminderDate instanceof Date ? c.reminderDate : new Date(c.reminderDate ?? Date.now())).toISOString().split('T')[0],
        isPaid: !!c.isPaid,
      })));
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive',
      });
    }
  };

  const loadStats = async () => {
    try {
      const products = await ProductService.getAllProducts();
      const todaysSales = await SalesService.getTodaysSales();
      const todaysTotal = Array.isArray(todaysSales)
        ? todaysSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        : 0;
      const totalIncome = await SalesService.getTotalSales();

      setStats({
        todaySales: todaysTotal,
        totalProducts: products.length,
        totalIncome,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard stats',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadStats();
    loadFinancialData();
    loadChartData();
    
    // Update date and time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Derived KPI values (Income, Expenses, Profit)
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const profit = stats.totalIncome - totalExpenses;

  const [chartData, setChartData] = useState<Array<{ date: string; income: number; expenses: number }>>([]);

  const loadChartData = async () => {
    try {
      const sales = await db.sales.toArray();
      const allExpenses = await db.expenses.toArray();

      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const data = days.map(d => {
        const next = new Date(d);
        next.setHours(23, 59, 59, 999);

        const income = sales
          .filter(s => {
            const c = new Date(s.createdAt as any);
            return c >= d && c <= next && (s.paymentType as any) !== 'credits';
          })
          .reduce((sum, s) => sum + (s.total || 0), 0);

        const exp = allExpenses
          .filter(e => {
            const c = new Date(e.date);
            return c >= d && c <= next;
          })
          .reduce((sum, e) => sum + (e.amount || 0), 0);

        return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), income, expenses: exp };
      });

      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart data', error);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white dark:bg-gray-900"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">SmartPOS+</h1>
              <div className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                {currentDateTime.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})} {currentDateTime.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}
              </div>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-600 rounded-full shadow-inner">
                      <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="center" sideOffset={4} className="min-w-[10rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden z-50">
                  <DropdownMenuItem 
                    onClick={() => {
                      logout();
                      setLocation('/role-selection');
                    }}
                    className="h-10 px-3 py-0 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4 pb-20">
          {/* Welcome Header Section */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-pink-100 dark:bg-pink-900 p-4 rounded-xl shadow-lg mb-4"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Welcome, {user?.ownerName || user?.username || 'User'}!
              </h1>
              <div className="text-right">
                <div className="text-sm text-gray-700 dark:text-gray-300">Your Total Income</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">₱{stats.totalIncome.toFixed(2)}</div>
              </div>
            </div>
          </motion.div>

          
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setLocation('/transaction-history')}
            >
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <span data-testid="text-today-sales">₱{stats.todaySales.toFixed(2)}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">Today's Sales</div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setLocation('/inventory')}
            >
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <Package className="w-6 h-6 mr-1 text-blue-500" />
                <span data-testid="text-total-products">{stats.totalProducts}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">Total Products</div>
            </motion.div>

          

            
          </div>
          
          

          {/* Modern Dashboard Actions */}
          <div className="mb-6">
            <div className="max-w-6xl mx-auto bg-gradient-to-r from-white/40 via-pink-50/40 to-white/30 dark:from-gray-800/40 dark:via-pink-900/30 dark:to-gray-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Primary action hub */}
                <div className="md:col-span-2 bg-gradient-to-br from-pink-50/60 to-white/10 dark:from-pink-900/30 dark:to-gray-800/10 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quick Actions</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Essential workflows at a glance — tap to open.</p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <motion.button
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => setLocation('/purchased')}
                      className="w-full flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-black/30 rounded-lg shadow-md hover:scale-[1.02] transform transition-all border border-white/20 md:flex-row md:items-start md:gap-4 min-w-0 md:justify-between"
                    >
                      <div className="p-3 bg-pink-500/10 rounded-lg flex-shrink-0">
                        <Package className="w-6 h-6 text-pink-500" />
                      </div>
                      <div className="text-center md:text-left min-w-0 flex-1 whitespace-normal">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">Purchased</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{getFilteredPurchases().length} items</div>
                      </div>
                    </motion.button>

                    <motion.button
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      onClick={() => setLocation('/ledger')}
                      className="w-full flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-black/30 rounded-lg shadow-md hover:scale-[1.02] transform transition-all border border-white/20 md:flex-row md:items-start md:gap-4 min-w-0 md:justify-between"
                    >
                      <div className="p-3 bg-indigo-500/10 rounded-lg flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="text-center md:text-left min-w-0 flex-1 whitespace-normal">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">Ledger</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{getFilteredCreditors().length} creditors</div>
                      </div>
                    </motion.button>

                    <motion.button
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => setLocation('/expenses')}
                      className="w-full flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-black/30 rounded-lg shadow-md hover:scale-[1.02] transform transition-all border border-white/20 md:flex-row md:items-start md:gap-4 min-w-0 md:justify-between"
                    >
                      <div className="p-3 bg-emerald-500/10 rounded-lg flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="text-center md:text-left min-w-0 flex-1 whitespace-normal">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">Expenses</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{getFilteredExpenses().length} items</div>
                      </div>
                    </motion.button>

                    <motion.button
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      onClick={() => setLocation('/transaction-history')}
                      className="w-full flex flex-col items-center gap-2 p-4 bg-white/70 dark:bg-black/30 rounded-lg shadow-md hover:scale-[1.02] transform transition-all border border-white/20 md:flex-row md:items-start md:gap-4 min-w-0 md:justify-between"
                    >
                      <div className="p-3 bg-yellow-500/10 rounded-lg flex-shrink-0">
                        <Receipt className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div className="text-center md:text-left min-w-0 flex-1 whitespace-normal">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">Transactions</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">View past transactions</div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Secondary quick tools */}
                <div className="bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/30 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tools</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Additional utilities</p>
                    </div>
                    {/* Tools dropdown removed per request */}
                  </div>

                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setLocation('/report-blank')}
                    className="w-full flex items-center gap-3 p-3 rounded-md bg-gradient-to-r from-pink-50/60 to-white/30 dark:from-pink-900/20 dark:to-gray-800/10 border border-white/10 shadow-sm"
                  >
                    <FileText className="w-5 h-5 text-pink-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-800 dark:text-gray-100">Reports</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Generate business reports</div>
                    </div>
                  </motion.button>

                </div>
              </div>
            </div>
          </div>

          {/* Overview Graph + KPI Strip */}
          <div className="max-w-6xl mx-auto mt-6 bg-gradient-to-r from-white/30 to-transparent dark:from-gray-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md border border-white/6 overflow-visible">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2 bg-white/5 dark:bg-gray-800/40 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-3">Overview</div>
                <div className="w-full rounded-md overflow-visible">
                  <ChartContainer className="w-full" config={{ income: { color: 'var(--chart-1)' }, expenses: { color: 'var(--chart-2)' } }}>
                    <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
                      <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)' }} />
                      <YAxis tickFormatter={(v) => `₱${v}`} tick={{ fill: 'var(--muted-foreground)' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="income" stroke="var(--chart-1)" fill="url(#incomeGradient)" fillOpacity={0.14} />
                      <Area type="monotone" dataKey="expenses" stroke="var(--chart-2)" fill="url(#expensesGradient)" fillOpacity={0.10} />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-white/10 rounded-lg p-4 min-h-[64px]">
                  <div className="text-xs opacity-90">Total Income</div>
                  <div className="text-lg font-bold">₱{stats.totalIncome.toFixed(2)}</div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 min-h-[64px]">
                  <div className="text-xs opacity-90">Total Expenses</div>
                  <div className="text-lg font-bold">₱{totalExpenses.toFixed(2)}</div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 min-h-[64px]">
                  <div className="text-xs opacity-90">Profit</div>
                  <div className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-200' : 'text-red-300'}`}>₱{profit.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onTutorialClick={handleTutorialClick} />

        {/* Add Expense Dialog */}
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent className="max-w-md dark:bg-gray-800 dark:text-gray-200">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">Add New Expense</DialogTitle>
            </DialogHeader>
            
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(handleAddExpense)} className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Description</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          placeholder="e.g., Rent, Utilities, Supplies"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Amount (₱)</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          <option value="">Select category</option>
                          <option value="Rent">Rent</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Supplies">Supplies</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Date</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddExpenseOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#FF8882] hover:bg-[#D89D9D]"
                  >
                    Add Expense
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Purchase Dialog */}
        <Dialog open={isAddPurchaseOpen} onOpenChange={setIsAddPurchaseOpen}>
          <DialogContent className="max-w-md dark:bg-gray-800 dark:text-gray-200">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">Add New Purchase</DialogTitle>
            </DialogHeader>
            
            <Form {...purchaseForm}>
              <form onSubmit={purchaseForm.handleSubmit(handleAddPurchase)} className="space-y-4">
                <FormField
                  control={purchaseForm.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Product Name</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          placeholder="e.g., Coca Cola, Bread"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={purchaseForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Quantity</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={purchaseForm.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Cost (₱)</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={purchaseForm.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Supplier</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          placeholder="e.g., Coca Cola Company"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={purchaseForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Date</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddPurchaseOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#FF8882] hover:bg-[#D89D9D]"
                  >
                    Add Purchase
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Creditor Dialog */}
        <Dialog open={isAddCreditorOpen} onOpenChange={setIsAddCreditorOpen}>
          <DialogContent className="max-w-md dark:bg-gray-800 dark:text-gray-200">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">Add New Creditor</DialogTitle>
            </DialogHeader>
            
            <Form {...creditorForm}>
              <form onSubmit={creditorForm.handleSubmit(handleAddCreditor)} className="space-y-4">
                <FormField
                  control={creditorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Creditor Name</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          placeholder="e.g., Supplier Company, Bank"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={creditorForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Amount (₱)</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={creditorForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Description</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          placeholder="e.g., Inventory loan, Equipment financing"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={creditorForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Due Date</FormLabel>
                        <FormControl>
                          <input
                            type="date"
                            {...field}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creditorForm.control}
                    name="reminderDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Reminder Date</FormLabel>
                        <FormControl>
                          <input
                            type="date"
                            {...field}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddCreditorOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#FF8882] hover:bg-[#D89D9D]"
                  >
                    Add Creditor
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default AdminMain;
