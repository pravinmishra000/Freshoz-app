
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/pre-home');
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary via-green-200 to-white p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="relative flex items-center justify-center w-48 h-48"
      >
        <div className="absolute inset-0 glass-card rounded-full"></div>
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
          alt="Freshoz Logo"
          width={150}
          height={150}
          className="relative z-10 rounded-full"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        className="mt-8 glass-card py-2 px-6"
      >
        <h2 className="text-2xl font-bold text-foreground tracking-wide">
          Fresh & Fast
        </h2>
      </motion.div>
    </div>
  );
}
