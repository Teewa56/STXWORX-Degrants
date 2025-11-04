import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.jpg';

interface NavigationProps {
  currentPage?: 'home' | 'browse' | 'client' | 'freelancer';
}

export function Navigation({ currentPage = 'home' }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b-2 border-primary">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <button className="hover:opacity-80 transition-opacity py-2 px-2 md:px-4" data-testid="link-home">
            <div className="flex flex-col items-center gap-0.5 md:gap-1">
              <img src={logo} alt="STXWORX Logo" className="h-8 md:h-10 w-auto object-contain" />
              <p className="text-[8px] md:text-[10px] font-bold text-white tracking-wider whitespace-nowrap">
                POWER BY $STX AND $BTC - OVMARS ARMY
              </p>
            </div>
          </button>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              className={currentPage === 'home' ? 'text-primary' : ''}
              data-testid="nav-link-home"
            >
              Home
            </Button>
          </Link>
          <Link href="/browse">
            <Button 
              variant="ghost"
              className={currentPage === 'browse' ? 'text-primary' : ''}
              data-testid="nav-link-browse"
            >
              Browse
            </Button>
          </Link>
          <Link href="/client">
            <Button 
              variant="ghost"
              className={currentPage === 'client' ? 'text-primary' : ''}
              data-testid="nav-link-client"
            >
              Client
            </Button>
          </Link>
          <Link href="/freelancer">
            <Button 
              variant="ghost"
              className={currentPage === 'freelancer' ? 'text-primary' : ''}
              data-testid="nav-link-freelancer"
            >
              Freelancer
            </Button>
          </Link>
          <WalletConnect />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <WalletConnect />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Button>
            </Link>
            <Link href="/browse">
              <Button 
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Projects
              </Button>
            </Link>
            <Link href="/client">
              <Button 
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                Client Dashboard
              </Button>
            </Link>
            <Link href="/freelancer">
              <Button 
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                Freelancer Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
