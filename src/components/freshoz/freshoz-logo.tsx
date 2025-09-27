
import Image from 'next/image';

export function FreshozLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/brand%2FPNG%2Flogo-1800x1800-transparent.png?alt=media&token=c0768076-9cd1-4269-9b65-7ab12b48ea57"
        alt="Freshoz Logo"
        width={40}
        height={40}
      />
      <div>
        <h3 className="text-xl font-bold text-white">Freshoz</h3>
        <p className="text-xs text-white/80">Fresh & Fast</p>
      </div>
    </div>
  );
}
