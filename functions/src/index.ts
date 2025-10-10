
import * as functions from "firebase-functions";
import *admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Array of 7 dishes to rotate through
const DISHES = [
  {
    dishName: "Paneer Butter Masala",
    description: "Creamy paneer in a rich tomato and butter gravy.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/dishes%2Fpaneer-butter-masala.webp?alt=media&token=example-token-1",
    price: 250,
    cuisineType: "North Indian",
    preparationTime: "25 mins",
  },
  {
    dishName: "Chicken Biryani",
    description: "Aromatic basmati rice with tender chicken pieces.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/dishes%2Fchicken-biryani.webp?alt=media&token=example-token-2",
    price: 300,
    cuisineType: "Mughlai",
    preparationTime: "45 mins",
  },
  {
    dishName: "Masala Dosa",
    description: "Crispy rice crepe filled with spiced potatoes.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/dishes%2Fmasala-dosa.webp?alt=media&token=example-token-3",
    price: 150,
    cuisineType: "South Indian",
    preparationTime: "20 mins",
  },
  {
    dishName: "Dal Makhani",
    description: "Slow-cooked black lentils in a creamy sauce.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/dishes%2Fdal-makhani.webp?alt=media&token=example-token-4",
    price: 200,
    cuisineType: "North Indian",
    preparationTime: "40 mins",
  },
  {
    dishName: "Veg Hakka Noodles",
    description: "Stir-fried noodles with fresh vegetables.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/dishes%2Fhakka-noodles.webp?alt=media&token=example-token-5",
    price: 180,
    cuisineType: "Indo-Chinese",
    preparationTime: "15 mins",
  },
  {
    dishName: "Chole Bhature",
    description: "Spicy chickpea curry with fluffy fried bread.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/dishes%2Fchole-bhature.webp?alt=media&token=example-token-6",
    price: 170,
    cuisineType: "Punjabi",
    preparationTime: "30 mins",
  },
  {
    dishName: "Fish Curry",
    description: "Tangy fish curry made in traditional style.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/dishes%2Ffish-curry.webp?alt=media&token=example-token-7",
    price: 280,
    cuisineType: "Bengali",
    preparationTime: "35 mins",
  },
];

/**
 * Scheduled Cloud Function to create a new daily dish every day at 6 AM.
 * It rotates through the DISHES array.
 */
export const dailyDishScheduler = functions.pubsub
  .schedule("0 6 * * *") // Runs every day at 6:00 AM
  .timeZone("Asia/Kolkata") // Set to your local timezone
  .onRun(async (context) => {
    console.log("Running daily dish scheduler...");

    try {
      // 1. Deactivate all previous dishes
      const snapshot = await db.collection("daily_dishes")
                               .where("isActive", "==", true)
                               .get();

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        console.log(`Deactivating previous dish: ${doc.id}`);
        batch.update(doc.ref, { isActive: false });
      });
      await batch.commit();
      console.log("Deactivated all previous active dishes.");

      // 2. Determine which dish to feature today
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      const dishIndex = dayOfYear % DISHES.length;
      const todaysDish = DISHES[dishIndex];

      // 3. Create the new daily dish document
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of the day

      const newDish = {
        ...todaysDish,
        availableDate: admin.firestore.Timestamp.fromDate(today),
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("daily_dishes").add(newDish);
      console.log(`Successfully created new daily dish: ${todaysDish.dishName} with ID: ${docRef.id}`);

      return null;
    } catch (error) {
      console.error("Error running daily dish scheduler:", error);
      return null;
    }
  });

