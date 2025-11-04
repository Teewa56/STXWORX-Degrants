import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { connectWallet, disconnectWallet as disconnectWalletLib, isSignedIn, getUserAddress } from '@/lib/stacks';

export function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if user is already signed in
    if (isSignedIn()) {
      const address = getUserAddress();
      if (address) {
        setWalletAddress(address);
        localStorage.setItem('stx_wallet_address', address);
      }
    }
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    
    connectWallet(
      (address) => {
        setWalletAddress(address);
        localStorage.setItem('stx_wallet_address', address);
        setIsConnecting(false);
        window.location.reload(); // Refresh to update UI
      },
      () => {
        setIsConnecting(false);
      }
    );
  };

  const handleDisconnect = () => {
    disconnectWalletLib();
    setWalletAddress(null);
    window.location.reload(); // Refresh to update UI
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (walletAddress) {
    return (
      <div className="flex items-center gap-3" data-testid="wallet-connected">
        <Badge variant="outline" className="gap-2 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-xs" data-testid="text-wallet-address">
            {truncateAddress(walletAddress)}
          </span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          data-testid="button-disconnect-wallet"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      data-testid="button-connect-wallet"
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
