
'use client';

import { useState, useEffect, useRef } from 'react';
import { products } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryCard } from '@/components/freshoz/category-card';
import LocationGate from '@/components/freshoz/location-gate';
import FreshozBuddy from '@/components/freshoz/freshoz-buddy';
import SplashScreen from '@/components/freshoz/splash-screen';
import BottomNav from '@/components/freshoz/bottom-nav';
import { Footer } from '@/components/freshoz/footer';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart/cart-context';
import { Search, ChevronRight, User, Wallet, Mic, CheckCircle, X, Bike, ChevronLeft, Star, Clock, Shield, Truck, Sparkles, Home as HomeIcon, ShoppingBag, Utensils, Heart } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import GroupSelectionModal from '@/components/freshoz/group-selection-modal';
import { db } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  bgColor: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [currentCarousel, setCurrentCarousel] = useState(0);
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const { cartItems, cartTotal } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const freeDeliveryThreshold = 199;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);
  const [isDeliveryBannerVisible, setIsDeliveryBannerVisible] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<{products: Product[], name: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Firestore se products fetch karen
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productsList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setFirestoreProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setFirestoreProducts(products); // fallback to local data
      }
    };
    fetchProducts();
  }, []);

  const allProducts = firestoreProducts.length > 0 ? firestoreProducts : products;

  // Group products define karen - Firestore products use karen
  const frequentlyBoughtGroups = [
    {
      name: 'Cooking Essentials',
      products: allProducts
        .filter(p => p.category === 'Vegetables').slice(0, 2),
      icon: Utensils,
      savings: 'Save ₹50'
    },
    {
      name: 'Breakfast Combo', 
      products: allProducts
        .filter(p => p.category === 'Fruits').slice(0, 2),
      icon: ShoppingBag,
      savings: 'Save ₹30'
    },
    {
      name: 'Fresh Fruits',
      products: allProducts
        .filter(p => p.category === 'Fruits').slice(2, 4),
      icon: Heart, 
      savings: 'Save ₹40'
    },
    {
      name: 'Snack Time',
      products: allProducts
        .filter(p => p.category === 'Bakery').slice(0, 2),
      icon: ShoppingBag,
      savings: 'Save ₹25'
    }
  ].filter(group => group.products.length === 2);


  const finalGroups = frequentlyBoughtGroups;

  // Handle group click function
  const handleGroupClick = (group: typeof finalGroups[0]) => {
    if (group.products.length === 2) {
      const uniqueProducts = group.products.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      setSelectedGroup({ 
        products: uniqueProducts.slice(0, 2),
        name: group.name 
      });
      setIsModalOpen(true);
    }
  };

  // Enhanced Carousel data
  const carouselItems: CarouselItem[] = [
    {
      id: 1,
      title: "Fresh Vegetables",
      description: "Get farm fresh vegetables delivered to your doorstep",
      image: "https://picsum.photos/seed/carousel-1/1200/800",
      buttonText: "Shop Now",
      bgColor: "from-green-400/20 to-yellow-300/20",
      href: "/products",
      icon: Utensils
    },
    {
      id: 2,
      title: "Daily Dairy",
      description: "Pure milk, curd, paneer and more",
      image: "https://picsum.photos/seed/carousel-2/1200/800",
      buttonText: "Explore Dairy",
      bgColor: "from-yellow-300/20 to-amber-200/20",
      href: "/products",
      icon: ShoppingBag
    },
    {
      id: 3,
      title: "Groceries & Staples",
      description: "All your kitchen essentials in one place",
      image: "https://picsum.photos/seed/carousel-3/1200/800",
      buttonText: "Buy Now",
      bgColor: "from-amber-400/20 to-green-300/20",
      href: "/products",
      icon: HomeIcon
    }
  ];

  // Enhanced Value propositions
  const valueProps = [
    { icon: Truck, title: 'Free Delivery', description: 'Above ₹199', color: 'text-yellow-300', bg: 'bg-yellow-500/20' },
    { icon: Clock, title: 'Quick Delivery', description: 'Within 2 hours', color: 'text-green-300', bg: 'bg-green-500/20' },
    { icon: Shield, title: 'Quality Guarantee', description: 'Fresh products', color: 'text-yellow-300', bg: 'bg-yellow-500/20' },
    { icon: Star, title: '4.8/5 Rating', description: 'Customer reviews', color: 'text-green-300', bg: 'bg-green-500/20' },
  ];

  const categories: Omit<Category, 'id'>[] = [
      { name_en: "Vegetables", slug: "vegetables", name_hi: "सब्जियां", display_order: 1, is_active: true },
      { name_en: "Fruits", slug: "fruits", name_hi: "फल", display_order: 2, is_active: true },
      { name_en: "Dairy", slug: "dairy", name_hi: "डेयरी", display_order: 3, is_active: true },
      { name_en: "Bakery", slug: "bakery", name_hi: "बेकरी", display_order: 4, is_active: true },
      { name_en: "Beverages", slug: "beverages", name_hi: "पेय पदार्थ", display_order: 5, is_active: true },
  ];

  const displayCategories = categories;

  useEffect(() => {
    console.log("📦 Firestore Products:", firestoreProducts);
    console.log("📦 Local Products:", products);
  }, [firestoreProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    
    const carouselTimer = setInterval(() => {
      setCurrentCarousel((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(carouselTimer);
    };
  }, []);

  const nextCarousel = () => {
    setCurrentCarousel((prev) => (prev + 1) % carouselItems.length);
  };

  const prevCarousel = () => {
    setCurrentCarousel((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const results = allProducts.filter(product =>
      product.name_en?.toLowerCase().includes(lowercasedQuery) ||
      product.brand?.toLowerCase().includes(lowercasedQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery)) || false
    );
    setFilteredProducts(results);
  }, [searchQuery, allProducts]);

  const handleMicClick = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      toast({
        variant: 'destructive',
        title: 'Browser not supported',
        description: 'Voice search is not supported on your browser.',
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsRecording(true);
      toast({ title: 'Listening...', description: 'Speak into your microphone.' });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      toast({
        variant: 'destructive',
        title: 'Voice search error',
        description: event.error,
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  if (loading) {
      return <SplashScreen />;
  }

  return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="absolute top-20 right-20 animate-bounce">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div className="absolute bottom-20 left-20 animate-bounce delay-300">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          
          {/* Search Bar */}
          <div className="sticky top-24 z-40 w-full p-4">
            <div className="container mx-auto">
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="search"
                  placeholder="Search for atta, dal, milk, fruits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl bg-background/80 backdrop-blur-lg border-2 text-foreground placeholder:text-muted-foreground pl-12 pr-12 py-5 focus:border-primary transition-all duration-300 font-medium"
                />
                <button 
                  onClick={handleMicClick} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10" 
                >
                  <Mic className={cn("h-5 w-5", isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground")} />
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1 pb-20 relative z-10">
            <LocationGate />

            {searchQuery.trim() !== '' ? (
              <div className="container mx-auto px-4 py-6">
                <h2 className="font-bold text-xl mb-4 text-foreground">Search Results for "{searchQuery}"</h2>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} variant="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No products found matching your search.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Carousel Section */}
                <section className="relative mb-8 mt-4">
                  <div className="container mx-auto px-4">
                    <div className="relative h-80 w-full rounded-3xl overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentCarousel}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className={`absolute inset-0 bg-gradient-to-r ${carouselItems[currentCarousel].bgColor} flex items-center p-8 rounded-3xl`}
                        >
                          <div className="absolute inset-0">
                            <img
                              src={carouselItems[currentCarousel].image}
                              alt={carouselItems[currentCarousel].title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                          </div>
          
                          <div className="relative z-10 text-white max-w-md">
                            <div className="flex items-center gap-2 mb-3">
                              {(() => {
                                const IconComponent = carouselItems[currentCarousel].icon;
                                return <IconComponent className="w-6 h-6 text-accent" />;
                              })()}
                              <h2 className="text-3xl font-bold">{carouselItems[currentCarousel].title}</h2>
                            </div>
                            <p className="text-lg mb-6 text-white/90">{carouselItems[currentCarousel].description}</p>
            
                            <Link href={carouselItems[currentCarousel].href}>
                              <Button className="glass-card rounded-2xl border-2 border-white/40 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3">
                                {carouselItems[currentCarousel].buttonText}
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      <button
                        onClick={prevCarousel}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 glass-card border-2 border-white/40 p-3 rounded-2xl shadow-lg z-20 hover:scale-110 transition-all"
                      >
                        <ChevronLeft className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={nextCarousel}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 glass-card border-2 border-white/40 p-3 rounded-2xl shadow-lg z-20 hover:scale-110 transition-all"
                      >
                        <ChevronRight className="h-5 w-5 text-white" />
                      </button>

                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                        {carouselItems.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentCarousel(index)}
                            className={cn(
                              "w-3 h-3 rounded-full transition-all border-2 border-white",
                              index === currentCarousel ? "bg-accent" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Categories Section */}
                <section className="container mx-auto px-4 py-8">
                  <h2 className="font-bold text-2xl mb-6 text-foreground text-left">Shop by Category</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayCategories.map((category: any, i: number) => (
                      <Link key={i} href={`/products`} className="block">
                        <div className="glass-card rounded-2xl border-2 border-border p-4 bg-background/10 hover:bg-accent/20 transition-all duration-300 h-40 flex flex-col items-center justify-center text-center">
                          <div className="mb-3 p-3 rounded-2xl bg-primary/10 text-3xl">
                            {category.name_en.includes('Vegetable') ? '🥦' :
                             category.name_en.includes('Dairy') ? '🥛' :
                             category.name_en.includes('Staples') ? '🍚' :
                             category.name_en.includes('Snacks') ? '🍿' :
                             category.name_en.includes('Eggs') ? '🥚' :
                             category.name_en.includes('Chicken') ? '🍗' :
                             category.name_en.includes('Personal') ? '🧴' :
                             category.name_en.includes('Home') ? '🏠' :
                             category.name_en.includes('Baby') ? '👶' :
                             category.name_en.includes('Health') ? '💊' :
                             category.name_en.includes('Pet') ? '🐕' :
                             category.name_en.includes('Kitchen') ? '🔪' : '🛒'}
                          </div>
                          <h3 className="font-semibold text-foreground text-sm mb-1 leading-tight">{category.name_en}</h3>
                          <p className="text-muted-foreground text-xs">{Math.floor(Math.random() * 10) + 5}+ items</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Today's Deals Section */}
                <section className="container mx-auto px-4 py-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-2xl text-foreground">🔥 Today's Deals</h2>
                    <Link href="/products" className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1">
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allProducts.length > 0 ? (
                      allProducts.slice(0, 8).map(product => (
                        <ProductCard key={product.id} product={product} variant="grid" />
                      ))
                    ) : (
                      <div className="col-span-4 text-center py-10">
                        <p className="text-muted-foreground">Loading products...</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Value Propositions */}
                <div className="py-6">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {valueProps.map((prop, index) => (
                        <div key={index} className="glass-card rounded-2xl border-2 border-border p-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${prop.bg}`}>
                              <prop.icon className={`h-5 w-5 ${prop.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                              <p className="text-xs text-muted-foreground">{prop.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Frequently Bought Section */}
                {finalGroups.length > 0 && (
                  <section className="container mx-auto px-4 py-6 my-6">
                    <h2 className="font-bold text-2xl mb-6 text-foreground text-left">Frequently Bought Together</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {finalGroups.map((group, index) => (
                        <div 
                          key={`group-${index}`}
                          onClick={() => handleGroupClick(group)}
                          className="glass-card rounded-2xl border-2 border-border p-3 bg-background/10 hover:scale-105 transition-all duration-300 group min-h-80 flex flex-col cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2 mb-3 min-h-[3rem]">
                            <div className="p-2 rounded-full bg-accent/30 flex-shrink-0">
                              <group.icon className="w-4 h-4 text-accent" />
                            </div>
                            <p className="font-bold text-foreground text-sm leading-tight text-center line-clamp-2 break-words">
                              {group.name}
                            </p>
                          </div>

                          <div className="flex-1 grid grid-rows-2 gap-2 mb-3 min-h-[120px]">
                            {group.products.map((product, productIndex) => {
                              const discountPercent = product.mrp && product.price && product.mrp > product.price 
                                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                                : 0;
                                
                              return (
                                <div 
                                  key={`${product.id}-${index}-${productIndex}`}
                                  className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-lg p-2 min-h-[60px]"
                                >
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                                    <img 
                                      src={product.image} 
                                      alt={product.name_en} 
                                      className="w-full h-full object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-foreground text-xs font-semibold truncate leading-tight">
                                      {product.name_en}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                      <span className="text-primary text-xs font-bold whitespace-nowrap">
                                        ₹{product.price}
                                      </span>
                                      {discountPercent > 0 && product.mrp && (
                                        <>
                                          <span className="text-muted-foreground text-xs line-through whitespace-nowrap">
                                            ₹{product.mrp}
                                          </span>
                                          <span className="text-destructive text-xs font-bold whitespace-nowrap">
                                            {discountPercent}%
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground text-xs truncate mt-0.5">
                                      {product.brand || 'Generic'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-auto">
                            <div className="bg-green-500/20 rounded-full py-1 px-2 text-center mb-2">
                              <span className="text-green-500 text-xs font-bold whitespace-nowrap">
                                {group.savings}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-muted-foreground text-xs">Tap to add both</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedGroup && (
                      <GroupSelectionModal
                        products={selectedGroup.products}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        groupName={selectedGroup.name}
                      />
                    )}
                  </section>
                )}

                {/* Best Sellers Section */}
                <section className="container mx-auto px-4 py-8">
                  <h2 className="font-bold text-2xl mb-6 text-foreground">⭐ Best Sellers</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allProducts.length > 8 ? (
                      allProducts.slice(8, 16).map(product => (
                        <ProductCard key={product.id} product={product} variant="grid" />
                      ))
                    ) : (
                      <div className="col-span-4 text-center py-10">
                        <p className="text-muted-foreground">More products loading...</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </main>

          <FreshozBuddy isDeliveryBannerVisible={isDeliveryBannerVisible} />

          {cartItems.length > 0 && (
            <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
              <div className="mx-auto max-w-md">
                {isDeliveryBannerVisible && (
                  cartTotal >= freeDeliveryThreshold ? (
                    <div className="mb-2 glass-card rounded-2xl border-2 border-white/30 p-3 text-foreground backdrop-blur-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500"/>
                          <p className="font-medium">🎉 Yay! You got FREE Delivery</p>
                        </div>
                        <button onClick={() => setIsDeliveryBannerVisible(false)} className="p-1 rounded-full hover:bg-white/20">
                          <X className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2 glass-card rounded-2xl border-2 border-white/30 p-3 text-foreground backdrop-blur-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bike className="h-5 w-5 text-yellow-500"/>
                          <p>Add <span className="font-bold">₹{amountNeededForFreeDelivery}</span> for free delivery</p>
                        </div>
                        <button onClick={() => setIsDeliveryBannerVisible(false)} className="p-1 rounded-full hover:bg-white/20">
                          <X className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>
                  )
                )}
                <Link href="/cart">
                  <div className="glass-card rounded-2xl border-2 border-white/30 p-3 text-foreground backdrop-blur-lg hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative flex">
                          {cartItems.slice(0, 2).map((item, index) => (
                            <div key={item.id} className="relative h-10 w-10 rounded-full border-2 border-white bg-white" style={{ zIndex: 2 - index, marginLeft: index > 0 ? '-12px' : 0 }}>
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-full p-1" />
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">View Cart</span>
                          <span className="text-xs text-muted-foreground">{totalItems} items • ₹{cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5"/>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          <div className="fixed bottom-0 left-0 w-full z-40 glass-card rounded-t-3xl border-t-2 border-white/30 backdrop-blur-lg">
            <BottomNav />
          </div>

          <Footer />
        </motion.div>
  );
}
