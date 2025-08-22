import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, DollarSign, Package } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { SalesService, ProductService } from '@/lib/db';

const AdminMain: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const todaysSales = await SalesService.getTodaysSales();
        const todaysTotal = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
        const products = await ProductService.getAllProducts();
        
        setStats({
          todaySales: todaysTotal,
          totalProducts: products.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50"
      >
        {/* Header */}
        <div className="bg-primary-500 text-white p-6 rounded-b-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold" data-testid="text-store-name">
                {user?.businessName || 'Kanegosyo Store'}
              </h1>
              <p className="text-primary-100 text-sm">Admin Dashboard</p>
            </div>
            <button
              onClick={logout}
              data-testid="button-logout"
              className="bg-primary-600 p-2 rounded-lg touch-feedback"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="text-2xl font-bold text-gray-800 flex items-center">
                <DollarSign className="w-6 h-6 mr-1 text-green-500" />
                <span data-testid="text-today-sales">₱{stats.todaySales.toFixed(2)}</span>
              </div>
              <div className="text-gray-500 text-sm">Today's Sales</div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="text-2xl font-bold text-gray-800 flex items-center">
                <Package className="w-6 h-6 mr-1 text-blue-500" />
                <span data-testid="text-total-products">{stats.totalProducts}</span>
              </div>
              <div className="text-gray-500 text-sm">Total Products</div>
            </motion.div>
          </div>
          
          {/* Welcome Message for New Users */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm text-center"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Ready to start selling?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Use the navigation below to access Scanner, manage Inventory, Staff, or update your Profile.
            </p>
            <div className="text-primary-500 text-sm">
              👇 Use the bottom navigation to get started
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default AdminMain;
