import { Link } from 'wouter';
import { Github, Twitter, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.jpg';

export function Footer() {
  return (
    <footer className="bg-black/95 border-t-2 border-primary mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1">
            <div className="flex flex-col items-start">
              <div className="flex flex-col gap-2 mb-3">
                <img src={logo} alt="STXWORX Logo" className="h-12 w-auto object-contain" />
                <p className="text-[10px] font-bold text-white tracking-wider">
                  POWER BY $STX AND $BTC - OVMARS ARMY
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Decentralized freelance platform built on Stacks blockchain with secure escrow payments.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link href="/client" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/freelancer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Freelancer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://docs.stacks.co/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Stacks Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://www.hiro.so/wallet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Get Wallet
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About OVMARS ARMY
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">Community</h3>
            <ul className="space-y-2 mb-4">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/ovmars" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Join Community
                </a>
              </li>
            </ul>
            <div className="flex gap-3">
              <a 
                href="https://twitter.com/ovmars" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
              >
                <Twitter className="h-4 w-4 text-primary" />
              </a>
              <a 
                href="https://github.com/ovmars" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="View our GitHub repository"
                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
              >
                <Github className="h-4 w-4 text-primary" />
              </a>
              <a 
                href="https://discord.gg/ovmars" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Join our Discord community"
                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} STX Freelance Hub. Built on Stacks Blockchain. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
