import { useState, useEffect } from 'react';

interface PreOrderData {
  dishId: string;
  dishName: string;
  scheduledDate: string;
  scheduledTime: string;
  quantity: number;
  specialInstructions?: string;
}

interface DailyDish {
  id: string;
  dishName: string;
  description: string;
  imageUrl: string;
  price: number;
  cuisineType: string;
}

// Get tomorrow's date in YYYY-MM-DD format
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Get today's date in readable format
const getTodayReadable = () => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};

// Get tomorrow's date in readable format
const getTomorrowReadable = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};

// Generate available time slots (11:45 AM se start)
const generateTimeSlots = () => {
  const slots = [];
  let hour = 11;
  let minute = 45;
  
  // 11:45 AM to 11:45 PM tak ke slots (12 hours)
  for (let i = 0; i < 24; i++) {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    
    slots.push({
      value: timeString,
      label: displayTime
    });
    
    // 30 minutes increment
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
    if (hour >= 24) {
      break; // Stop at midnight
    }
  }
  
  return slots;
};

export const usePreOrder = (dish: DailyDish | null) => {
  const [showPreOrderDialog, setShowPreOrderDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [preOrderData, setPreOrderData] = useState<PreOrderData>({
    dishId: '',
    dishName: '',
    scheduledDate: getTomorrowDate(),
    scheduledTime: '11:45',
    quantity: 1,
    specialInstructions: ''
  });

  const handlePreOrderSubmit = () => {
    if (!dish) return;
    
    console.log('Pre-order Data:', preOrderData);
    
    const selectedTimeSlot = generateTimeSlots().find(slot => slot.value === preOrderData.scheduledTime);
    
    const successMessage = `✅ ${preOrderData.dishName} pre-ordered successfully!

📅 Delivery Date: ${getTomorrowReadable()}
⏰ Delivery Time: ${selectedTimeSlot?.label || '11:45 AM'}
📦 Quantity: ${preOrderData.quantity}

📋 Cancellation Policy:
✓ Cancel today (${getTodayReadable()}) - FULL REFUND
✗ Cancel tomorrow (${getTomorrowReadable()}) - NO REFUND

Thank you for your pre-order!`;

    alert(successMessage);
    setShowPreOrderDialog(false);
  };

  // Update preOrderData when dish changes
  useEffect(() => {
    if (dish) {
      setPreOrderData(prev => ({
        ...prev,
        dishId: dish.id,
        dishName: dish.dishName,
        scheduledDate: getTomorrowDate()
      }));
    }
  }, [dish]);

  return {
    showPreOrderDialog,
    setShowPreOrderDialog,
    showPolicyDialog,
    setShowPolicyDialog,
    preOrderData,
    setPreOrderData,
    handlePreOrderSubmit,
    timeSlots: generateTimeSlots(),
    getTodayReadable,
    getTomorrowReadable
  };
};