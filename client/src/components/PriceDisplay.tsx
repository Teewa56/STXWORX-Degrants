import { useTokenUsdValue } from '@/hooks/use-prices';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceDisplayProps {
  amount: number;
  tokenType: 'STX' | 'sBTC';
  showIcon?: boolean;
  className?: string;
}

/**
 * Displays real-time USD equivalent for crypto amounts
 * Updates automatically every 60 seconds
 */
export function PriceDisplay({ 
  amount, 
  tokenType, 
  showIcon = true,
  className = '' 
}: PriceDisplayProps) {
  const { formattedUsd, price, loading } = useTokenUsdValue(amount, tokenType);

  if (loading) {
    return <Skeleton className="h-5 w-24" />;
  }

  return (
    <div className={`flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}>
      {showIcon && <DollarSign className="h-3.5 w-3.5" />}
      <span>{formattedUsd}</span>
      <span className="text-xs opacity-70">
        @ ${price.toFixed(tokenType === 'STX' ? 3 : 0)}/{tokenType}
      </span>
    </div>
  );
}

interface LivePriceIndicatorProps {
  tokenType: 'STX' | 'sBTC';
}

/**
 * Shows live price indicator with pulsing animation
 */
export function LivePriceIndicator({ tokenType }: LivePriceIndicatorProps) {
  const { price, loading } = useTokenUsdValue(1, tokenType);

  if (loading) {
    return <Skeleton className="h-6 w-32" />;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <TrendingUp className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-sm font-medium">
        {tokenType} = ${price.toFixed(tokenType === 'STX' ? 3 : 0)}
      </span>
    </div>
  );
}
