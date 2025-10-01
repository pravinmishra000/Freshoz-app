
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Wallet, User, Phone } from "lucide-react";

// Named export bana den
export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/products", icon: Home, label: "Home" },
    { href: "/products/category", icon: LayoutGrid, label: "Categories" },
    { href: "/wallet", icon: Wallet, label: "Wallet" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/chat", icon: Phone, label: "Support" },
  ];

  return (
    <>
      {/* Bottom Nav Container */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Glass Morphism Background with Dark Green Border */}
        <div className="backdrop-blur-lg bg-white/10 rounded-t-3xl border-t border-emerald-800/30">
          <div className="flex justify-around items-center py-3 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center space-y-1 transition-all duration-200"
                >
                  {/* Icon - Dark Green with Active State */}
                  <Icon
                    size={22}
                    className={`transition-colors duration-200 ${
                      isActive 
                        ? "text-emerald-700 scale-110" 
                        : "text-emerald-800/90"
                    }`}
                  />
                  
                  {/* Text - Dark Green with Active State */}
                  <span
                    className={`text-xs font-medium transition-colors duration-200 ${
                      isActive 
                        ? "text-emerald-700 font-semibold" 
                        : "text-emerald-800/90"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Padding for Page Content */}
      <div className="pb-20" />
    </>
  );
};

// Default export bhi maintain karen
export default BottomNav;
