import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from '@/assets/logo.jpg';
import { useAuth } from '@/hooks/use-auth';

interface NavigationProps {
  currentPage?: 'home' | 'browse' | 'client' | 'freelancer';
}

export function Navigation({ currentPage = 'home' }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || ''} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href={user.role === 'client' ? '/client' : '/freelancer'}>
                    <DropdownMenuItem className="cursor-pointer">
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="default" className="gap-2">
                <User className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
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

      {/* Mobile Menu */ }
  {
    mobileMenuOpen && (
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
    )
  }
    </header >
  );
}
