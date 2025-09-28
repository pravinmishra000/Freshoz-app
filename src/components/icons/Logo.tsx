import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: SVGProps<SVGSVGElement> & { width?: number; height?: number }) {
  // Use fixed base dimensions to ensure consistency between server and client renders
  const baseHeight = 60;
  const baseWidth = 240;

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
          alt="Freshoz Logo"
          width={baseHeight}
          height={baseHeight}
          className="relative z-10 rounded-full"
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 220 50" // viewBox adjusted for text
          height={baseHeight * 0.8} // Scale SVG relative to the logo's total height
          width={baseWidth}
          {...props}
          // Remove explicit width/height from props to avoid override
          width={undefined}
          height={undefined}
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-glow))' }} />
            </linearGradient>
          </defs>
          <text
            x="50%" // Center the text
            y="38" // Adjusted y-position for better vertical alignment
            textAnchor="middle" // Anchor text from its center
            fontFamily="var(--font-poppins), sans-serif"
            fontSize="50" // Slightly increased font size
            fontWeight="bold"
            fill="url(#logo-gradient)"
            className="font-headline uppercase" // Make text uppercase
          >
            FRESHOZ
          </text>
        </svg>
        <p className="text-sm text-muted-foreground tracking-wider -mt-2">
          Fresh &amp; Fast
        </p>
      </div>
    </div>
  );
}
