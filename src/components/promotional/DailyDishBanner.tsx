'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { useDailyDish } from './hooks/useDailyDish';
import { usePreOrder } from './hooks/usePreOrder';
import BannerCard from './components/BannerCard';
import PreOrderDialog from './components/PreOrderDialog';
import PolicyDialog from './components/PolicyDialog';
import ReopenHint from './components/ReopenHint';

export default function DailyDishBanner() {
  const { appUser, loading: authLoading } = useAuth();
  
  const {
    dish,
    isVisible,
    isLoading,
    error,
    showReopenHint,
    timeLeft,
    handleClose,
    handleReopen
  } = useDailyDish();

  const {
    showPreOrderDialog,
    setShowPreOrderDialog,
    showPolicyDialog,
    setShowPolicyDialog,
    preOrderData,
    setPreOrderData,
    handlePreOrderSubmit,
    timeSlots,
    getTodayReadable,
    getTomorrowReadable
  } = usePreOrder(dish);

  // Agar user logged in nahi hai ya auth loading chal raha hai toh kuch na dikhayen
  if (!appUser || authLoading) {
    return null;
  }

  // Reopen Hint Button
  if (showReopenHint && !isVisible) {
    return <ReopenHint onReopen={handleReopen} />;
  }

  // Loading, Error, or Not Visible States
  if (isLoading || !isVisible || !dish) {
    return null;
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-xs md:hidden">
        <div className="bg-orange-100 border border-orange-200 p-4 rounded-lg">
          <p className="text-orange-700 text-sm">Daily special unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BannerCard
        dish={dish}
        timeLeft={timeLeft}
        onClose={handleClose}
        onPreOrderClick={() => setShowPreOrderDialog(true)}
        onPolicyClick={() => setShowPolicyDialog(true)}
      />

      <PreOrderDialog
        open={showPreOrderDialog}
        onOpenChange={setShowPreOrderDialog}
        dish={dish}
        preOrderData={preOrderData}
        setPreOrderData={setPreOrderData}
        timeSlots={timeSlots}
        getTodayReadable={getTodayReadable}
        getTomorrowReadable={getTomorrowReadable}
        onSubmit={handlePreOrderSubmit}
      />

      <PolicyDialog
        open={showPolicyDialog}
        onOpenChange={setShowPolicyDialog}
        getTodayReadable={getTodayReadable}
        getTomorrowReadable={getTomorrowReadable}
      />
    </>
  );
}