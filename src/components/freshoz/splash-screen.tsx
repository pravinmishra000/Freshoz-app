'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 3 seconds ke baad splash screen hide karein
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center 
                    bg-gradient-to-b from-green-500 to-white"
        >
          {/* Main content container with centering */}
          <div className="flex flex-col items-center justify-center w-full h-full">
            {/* Logo container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative mb-4 p-6 rounded-2xl bg-gradient-to-b from-green-500 to-white"
            >
              <motion.div 
                className="relative flex items-center justify-center w-32 h-32"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 1.8, 
                  ease: "easeOut",
                  delay: 0.3
                }}
              >
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-all-size%2Flogo-transparent-128x128.png?alt=media&token=06ed7ff4-43d2-418b-9472-21d8ff33bab8" 
                  alt="Freshoz Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="text-5xl font-black text-center mb-3 text-green-800 tracking-tight"
            >
              FRESHOZ
            </motion.h1>
            
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="text-2xl font-medium text-center mb-6 text-green-800 tracking-wide relative"
            >
              Fresh & Fast
              <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-800 to-transparent"></span>
            </motion.p>
            
            {/* Progress bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6"
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 1 }}
              />
            </motion.div>
            
            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-sm text-gray-500 font-medium mb-1"
            >
              Loading the freshest experience...
            </motion.p>
            
            {/* Version info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="text-xs text-gray-400 mt-4"
            >
              Version 2.0.0
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
