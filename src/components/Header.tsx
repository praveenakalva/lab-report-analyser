import React from 'react';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="px-6 py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary font-semibold text-xl hover:opacity-80 transition-opacity">
          <HeartPulse className="w-6 h-6 text-blue-500" />
          <span>Lab Report Insight</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/" 
            className={`transition-colors ${pathname === '/' ? 'text-blue-600 font-bold' : 'text-muted-foreground hover:text-primary'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/compare" 
            className={`transition-colors ${pathname === '/compare' ? 'text-blue-600 font-bold' : 'text-muted-foreground hover:text-primary'}`}
          >
            Compare Reports
          </Link>
        </nav>
      </div>
    </header>
  );
};
