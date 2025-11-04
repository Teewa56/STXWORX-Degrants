import { useState, useEffect } from 'react';
import { fetchCryptoPrices, type PriceData } from '@/lib/prices';

/**
 * React hook for real-time crypto prices
 * Updates every 60 seconds automatically
 */
export function useCryptoPrices() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const data = await fetchCryptoPrices();
        setPrices(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching prices:', err);
        setError(err.message || 'Failed to fetch prices');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    // Update every 60 seconds
    const interval = setInterval(fetchPrices, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
}

/**
 * Hook to calculate USD value for a specific token amount
 */
export function useTokenUsdValue(amount: number, tokenType: 'STX' | 'sBTC') {
  const { prices, loading } = useCryptoPrices();
  
  const usdValue = prices 
    ? amount * (tokenType === 'STX' ? prices.stxUsd : prices.btcUsd)
    : 0;

  const formattedUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdValue);

  return {
    usdValue,
    formattedUsd,
    price: prices ? (tokenType === 'STX' ? prices.stxUsd : prices.btcUsd) : 0,
    loading,
  };
}
