
'use client';

import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

export function Footer() {
    return (
        <footer className="w-full mt-12 pb-24 relative z-10">
            <div className="container mx-auto px-4 text-center">
                <div className="mb-4">
                    <Logo width={150} height={40} />
                </div>
                <p className="text-muted-foreground text-sm">
                    © {new Date().getFullYear()} Freshoz. All Rights Reserved.
                </p>
                <div className="flex justify-center gap-4 mt-4">
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About</Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
