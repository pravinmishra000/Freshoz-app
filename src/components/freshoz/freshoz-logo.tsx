import { Leaf } from 'lucide-react';
import Image from 'next/image';

// ✅ Add interface for props
interface FreshozLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function FreshozLogo({ size = 'lg' }: FreshozLogoProps) {
  const sizes = {
    sm: { logo: 40, text: 'text-2xl', tagline: 'text-xs', gap: 'gap-2' },
    md: { logo: 60, text: 'text-4xl', tagline: 'text-sm', gap: 'gap-3' },
    lg: { logo: 80, text: 'text-5xl', tagline: 'text-base', gap: 'gap-4' }
  };

  const { logo: logoSize, text: textSize, tagline: taglineSize, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Logo */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
          alt="Freshoz Logo"
          width={logoSize}
          height={logoSize}
          className="relative z-10 rounded-full"
          priority
        />
      </div>
      
      {/* Text and Tagline */}
      <div className="flex flex-col justify-center">
        <h1
          className={`${textSize} font-extrabold tracking-tight text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-none uppercase`}
          style={{
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "-1px",
          }}
        >
          FRESHOZ
        </h1>
        <span className={`${taglineSize} text-muted-foreground font-medium mt-0.5 text-center drop-shadow-sm`}>
          Fresh & Fast
        </span>
      </div>
    </div>
  );
}
