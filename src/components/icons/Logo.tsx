
import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: SVGProps<SVGSVGElement> & { width?: number; height?: number }) {
  const baseHeight = 60;
  const baseWidth = 240;

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="relative flex-shrink-0 h-[50px] w-[50px]">
        <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
          alt="Freshoz Logo"
          fill
          className="relative z-10 rounded-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <svg
          viewBox="0 0 220 50"
          height={32}
          width={150}
          {...props}
          width={undefined}
          height={undefined}
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--positive))' }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--positive))' }} />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="35"
            textAnchor="middle"
            fontFamily="var(--font-poppins), sans-serif"
            fontSize="45"
            fontWeight="bold"
            fill="url(#logo-gradient)"
            className="font-headline uppercase"
          >
            FRESHOZ
          </text>
        </svg>
        <p className="text-xs text-muted-foreground tracking-wider -mt-2 text-center">
          Fresh &amp; Fast
        </p>
      </div>
    </div>
  );
}
