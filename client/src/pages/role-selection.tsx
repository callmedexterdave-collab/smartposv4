import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, UserCircle2, ArrowRight } from 'lucide-react';

const RoleSelection: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-700/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-700/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            <span className="text-white/60 text-xs font-medium tracking-widest uppercase">Select Access Mode</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
            <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              SmartPOS+
            </span>
          </h1>
          <p className="text-white/40 text-lg font-light max-w-md mx-auto">
            Experience the next generation of point of sale management. Choose your role to begin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => setLocation('/admin-login')}
            data-testid="button-select-admin"
            className="group relative flex flex-col items-start p-8 rounded-3xl bg-[#0f0f0f] border border-white/5 hover:border-primary-500/50 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-6 h-6 text-primary-500" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors duration-500">
              <ShieldCheck className="w-7 h-7 text-primary-500 group-hover:text-black" />
            </div>

            <h3 className="text-2xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-primary-400 group-hover:to-primary-600 transition-all">
                Administrator
              </span>
            </h3>
            <p className="text-white/40 text-sm leading-relaxed text-left group-hover:text-white/60 transition-colors">
              Full system control, inventory management, and detailed analytics reporting.
            </p>

            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-500/50">
              <span>Secure Entry</span>
              <div className="w-1 h-1 rounded-full bg-primary-500/30"></div>
              <span>Admin Dashboard</span>
            </div>
          </motion.button>

          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setLocation('/staff-login')}
            data-testid="button-select-staff"
            className="group relative flex flex-col items-start p-8 rounded-3xl bg-[#0f0f0f] border border-white/5 hover:border-primary-500/50 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-6 h-6 text-primary-500" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors duration-500">
              <UserCircle2 className="w-7 h-7 text-primary-500 group-hover:text-black" />
            </div>

            <h3 className="text-2xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-primary-400 group-hover:to-primary-600 transition-all">
                Staff Member
              </span>
            </h3>
            <p className="text-white/40 text-sm leading-relaxed text-left group-hover:text-white/60 transition-colors">
              Fast-track sales processing, customer checkout, and daily shift management.
            </p>

            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-500/50">
              <span>Quick Access</span>
              <div className="w-1 h-1 rounded-full bg-primary-500/30"></div>
              <span>Terminal Mode</span>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-white/20 text-xs tracking-widest uppercase">
            &copy; 2024 SmartPOS+ Systems. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;
