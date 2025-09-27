import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: SVGProps<SVGSVGElement> & { width?: number; height?: number }) {
  const baseWidth = props.width || 120;
  const baseHeight = props.height || 30;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
          alt="Freshoz Logo"
          width={baseHeight * 1.2} // Adjust size relative to height
          height={baseHeight * 1.2}
          className="mr-2"
        />
        <svg
          viewBox="0 0 220 50" // Increased viewBox width to prevent clipping
          width={baseWidth}
          height={baseHeight}
          {...props}
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-glow))' }} />
            </linearGradient>
          </defs>
          <text
            x="50%" // Center the text
            y="40"
            textAnchor="middle" // Anchor text from its center
            fontFamily="var(--font-poppins), sans-serif"
            fontSize="40"
            fontWeight="bold"
            fill="url(#logo-gradient)"
            className="font-headline"
          >
            FRESHOZ
          </text>
        </svg>
      </div>
      <p className="text-sm text-muted-foreground tracking-wider">
        Fresh &amp; Fast
      </p>
    </div>
  );
}
