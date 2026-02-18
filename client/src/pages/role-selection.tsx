import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Users, UserCheck, User } from 'lucide-react';

const RoleSelection: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#081229] via-[#0b1320] to-[#071025] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/6 mx-auto">
            <Users className="w-6 h-6 text-pink-400" />
            <h1 className="text-white text-lg font-semibold">SmartPOS+</h1>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">Welcome — Choose a role</h2>
          <p className="mt-2 text-sm text-white/70">Pick how you'll access SmartPOS+. Fast, secure, and focused.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => setLocation('/admin-login')}
            data-testid="button-select-admin"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-tr from-pink-600/30 to-purple-600/20 border border-white/6 shadow-2xl hover:scale-[1.02] transform transition-all"
          >
            <div className="absolute -left-16 -top-16 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl opacity-60"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/6 border border-white/6 mb-4">
                <UserCheck className="w-10 h-10 text-pink-300" />
              </div>
              <div className="text-white font-bold text-xl">ADMIN</div>
              <div className="text-white/70 text-sm mt-1 text-center">Full access — manage products, reports, and settings</div>
              <div className="mt-4 flex gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/6 text-white/90">Secure</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/6 text-white/90">Analytics</span>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setLocation('/staff-login')}
            data-testid="button-select-staff"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-tr from-sky-600/20 to-indigo-700/10 border border-white/6 shadow-2xl hover:scale-[1.02] transform transition-all"
          >
            <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-sky-500/8 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/6 border border-white/6 mb-4">
                <User className="w-10 h-10 text-sky-300" />
              </div>
              <div className="text-white font-bold text-xl">STAFF</div>
              <div className="text-white/70 text-sm mt-1 text-center">Quick mode — process sales and manage checkout</div>
              <div className="mt-4 flex gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/6 text-white/90">Quick</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/6 text-white/90">Offline-ready</span>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
