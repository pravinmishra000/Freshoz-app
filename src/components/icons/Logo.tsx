import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: SVGProps<SVGSVGElement> & { width?: number; height?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <Image 
          src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57" 
          alt="Freshoz Logo" 
          width={props.width ? Number(props.width) / 2.5 : 48} 
          height={props.height ? Number(props.height) / 2.5 : 48} 
          className="mr-2"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 50"
          width={props.width || 120}
          height={props.height || 30}
          {...props}
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-glow))' }} />
            </linearGradient>
          </defs>
          <text
            x="0"
            y="40"
            fontFamily="var(--font-poppins), sans-serif"
            fontSize="40"
            fontWeight="bold"
            fill="url(#logo-gradient)"
            className="font-headline"
          >
            Freshoz
          </text>
        </svg>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">Fresh &amp; Fast</p>
    </div>
  );
}