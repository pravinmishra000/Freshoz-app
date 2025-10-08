
import Image from 'next/image';

interface FreshozLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function FreshozLogo({ size = 'md' }: FreshozLogoProps) {
  const sizes = {
    sm: { logo: 50, text: 'text-2xl', tagline: 'text-xs', gap: 'gap-2' },
    md: { logo: 60, text: 'text-3xl', tagline: 'text-sm', gap: 'gap-3' },
    lg: { logo: 80, text: 'text-5xl', tagline: 'text-base', gap: 'gap-4' }
  };

  const { logo: logoSize, text: textSize, tagline: taglineSize, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      <div className="relative flex-shrink-0" style={{ height: `${logoSize}px`, width: `${logoSize}px` }}>
        <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
          alt="Freshoz Logo"
          fill
          className="relative z-10 object-contain"
          priority
          sizes={`${logoSize}px`}
        />
      </div>
      
      <div className="relative flex flex-col justify-center">
        <h1
          className={`${textSize} font-extrabold tracking-tight text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] leading-none uppercase`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          FRESHOZ
        </h1>
        <div className="relative text-center">
            <span className={`${taglineSize} text-primary/80 font-medium drop-shadow-sm`}>
                Fresh & Fast
            </span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-primary/20 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.2)]"></div>
        </div>
      </div>
    </div>
  );
}
