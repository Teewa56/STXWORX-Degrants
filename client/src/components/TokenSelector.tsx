import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bitcoin, Coins, TrendingUp } from 'lucide-react';
import { useCryptoPrices } from '@/hooks/use-prices';
import { Skeleton } from '@/components/ui/skeleton';

export type TokenType = 'STX' | 'sBTC';

interface TokenSelectorProps {
  selectedToken: TokenType;
  onTokenChange: (token: TokenType) => void;
  disabled?: boolean;
}

export function TokenSelector({ selectedToken, onTokenChange, disabled = false }: TokenSelectorProps) {
  const { prices, loading } = useCryptoPrices();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Payment Token</Label>
      <RadioGroup
        value={selectedToken}
        onValueChange={(value) => onTokenChange(value as TokenType)}
        disabled={disabled}
        className="grid grid-cols-2 gap-4"
      >
        {/* STX Option */}
        <Label
          htmlFor="token-stx"
          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${
            selectedToken === 'STX' ? 'border-primary bg-primary/5' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RadioGroupItem value="STX" id="token-stx" className="sr-only" />
          <div className="flex flex-col items-center space-y-2 text-center w-full">
            <Coins className={`h-8 w-8 ${selectedToken === 'STX' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="w-full">
              <div className="font-semibold">STX</div>
              <div className="text-xs text-muted-foreground mt-1">
                Native Stacks token
              </div>
              {/* Live Price */}
              {loading ? (
                <Skeleton className="h-4 w-20 mx-auto mt-2" />
              ) : prices ? (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  ${prices.stxUsd.toFixed(3)}
                </div>
              ) : null}
            </div>
          </div>
        </Label>

        {/* sBTC Option */}
        <Label
          htmlFor="token-sbtc"
          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${
            selectedToken === 'sBTC' ? 'border-primary bg-primary/5' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RadioGroupItem value="sBTC" id="token-sbtc" className="sr-only" />
          <div className="flex flex-col items-center space-y-2 text-center w-full">
            <Bitcoin className={`h-8 w-8 ${selectedToken === 'sBTC' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="w-full">
              <div className="font-semibold">sBTC</div>
              <div className="text-xs text-muted-foreground mt-1">
                Bitcoin on Stacks
              </div>
              {/* Live Price */}
              {loading ? (
                <Skeleton className="h-4 w-20 mx-auto mt-2" />
              ) : prices ? (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  ${prices.btcUsd.toLocaleString()}
                </div>
              ) : null}
            </div>
          </div>
        </Label>
      </RadioGroup>
      
      {selectedToken === 'sBTC' && (
        <div className="flex items-start space-x-2 rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
          <Bitcoin className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-blue-900 dark:text-blue-100">
            <strong>sBTC</strong> is Bitcoin wrapped on Stacks, allowing you to use Bitcoin in smart contracts. 1 sBTC = 1 BTC.
          </p>
        </div>
      )}
      
      {selectedToken === 'STX' && (
        <div className="flex items-start space-x-2 rounded-md bg-orange-50 dark:bg-orange-950/20 p-3 text-sm">
          <Coins className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <p className="text-orange-900 dark:text-orange-100">
            <strong>STX</strong> is the native cryptocurrency of the Stacks blockchain. Fast and low-cost transactions.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to format token amounts
export function formatTokenAmount(amount: number, token: TokenType): string {
  return `${amount.toFixed(token === 'sBTC' ? 8 : 6)} ${token}`;
}

// Helper to get token symbol
export function getTokenSymbol(token: TokenType): string {
  return token;
}

// Helper to get token decimals
export function getTokenDecimals(token: TokenType): number {
  return token === 'sBTC' ? 8 : 6; // BTC uses 8 decimals, STX uses 6
}
