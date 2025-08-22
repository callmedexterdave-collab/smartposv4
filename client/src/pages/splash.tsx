import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ScanBarcode } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation('/role-selection');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="logo-glow mb-6"
        >
          <ScanBarcode className="w-24 h-24 mb-4 mx-auto filter drop-shadow-lg" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-4xl font-bold mb-2 tracking-wide"
        >
          SmartPOS+
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-primary-100 text-lg font-medium opacity-90"
        >
          when technology meets enterprises
        </motion.p>
      </motion.div>
      
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10"
      >
        <div className="w-8 h-1 bg-white rounded-full"></div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
