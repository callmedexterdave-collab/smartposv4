import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Users, UserCheck, User } from 'lucide-react';

const RoleSelection: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pt-12"
        >
          <Users className="w-16 h-16 text-primary-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Role</h2>
          <p className="text-gray-600">Choose how you want to access SmartPOS+</p>
        </motion.div>
        
        <div className="space-y-4 px-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setLocation('/admin-login')}
            data-testid="button-select-admin"
            className="w-full bg-primary-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 touch-feedback"
          >
            <UserCheck className="w-12 h-12 mb-3 mx-auto" />
            <div className="text-xl font-semibold">ADMIN</div>
            <div className="text-primary-100 text-sm mt-1">Full system access</div>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setLocation('/staff-login')}
            data-testid="button-select-staff"
            className="w-full bg-gray-100 text-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-gray-200 touch-feedback"
          >
            <User className="w-12 h-12 mb-3 mx-auto text-gray-600" />
            <div className="text-xl font-semibold">STAFF</div>
            <div className="text-gray-500 text-sm mt-1">Sales access only</div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
