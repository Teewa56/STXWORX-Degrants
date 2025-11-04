// Crypto Price API Integration
// Fetches real-time STX and BTC prices in USD

export interface PriceData {
  stxUsd: number;
  btcUsd: number;
  lastUpdated: number;
}

// Cache prices for 1 minute to avoid too many API calls
let priceCache: PriceData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * Fetch current crypto prices from CoinGecko API (free, no API key required)
 * Returns prices for STX and BTC in USD
 */
export async function fetchCryptoPrices(): Promise<PriceData> {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (priceCache && (now - lastFetchTime) < CACHE_DURATION) {
    return priceCache;
  }

  try {
    // CoinGecko API - free tier, no API key needed
    // Fetches STX (stacks) and BTC (bitcoin) prices in USD
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=stacks,bitcoin&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract prices
    const stxUsd = data.stacks?.usd || 0;
    const btcUsd = data.bitcoin?.usd || 0;

    // Update cache
    priceCache = {
      stxUsd,
      btcUsd,
      lastUpdated: now,
    };
    lastFetchTime = now;

    console.log('💰 Prices updated:', priceCache);
    return priceCache;
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
    
    // Return cached data if available, or fallback prices
    if (priceCache) {
      return priceCache;
    }
    
    // Fallback prices (approximate as of Nov 2024)
    return {
      stxUsd: 0.50, // Approximate STX price
      btcUsd: 35000, // Approximate BTC price
      lastUpdated: now,
    };
  }
}

/**
 * Calculate USD value for STX amount
 */
export function calculateStxToUsd(stxAmount: number, priceData: PriceData): number {
  return stxAmount * priceData.stxUsd;
}

/**
 * Calculate USD value for sBTC amount (sBTC = BTC)
 */
export function calculateSbtcToUsd(sbtcAmount: number, priceData: PriceData): number {
  return sbtcAmount * priceData.btcUsd;
}

/**
 * Format USD amount with dollar sign and commas
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get real-time price for specific token
 */
export async function getTokenPriceUsd(tokenType: 'STX' | 'sBTC'): Promise<number> {
  const prices = await fetchCryptoPrices();
  return tokenType === 'STX' ? prices.stxUsd : prices.btcUsd;
}

/**
 * Convert token amount to USD with real-time prices
 */
export async function convertToUsd(
  amount: number,
  tokenType: 'STX' | 'sBTC'
): Promise<{ usdValue: number; formattedUsd: string; price: number }> {
  const prices = await fetchCryptoPrices();
  const price = tokenType === 'STX' ? prices.stxUsd : prices.btcUsd;
  const usdValue = amount * price;
  
  return {
    usdValue,
    formattedUsd: formatUsd(usdValue),
    price,
  };
}

/**
 * Hook-like function to get prices (can be used in components)
 */
export function useCryptoPrices() {
  return fetchCryptoPrices();
}
