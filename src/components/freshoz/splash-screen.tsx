
'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/icons/Logo';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
        <div className="mb-4">
            <Logo width={200} height={50} />
        </div>
        <motion.div
            className="h-1 w-32 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "8rem" }}
            transition={{ duration: 2, ease: "easeInOut" }}
        />
      <p className="mt-4 text-muted-foreground">Freshness Delivered, Fast.</p>
    </motion.div>
  );
}
