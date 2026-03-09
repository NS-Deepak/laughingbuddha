// Simple symbol validation without yahoo-finance2 (causes build issues)
// Validation will happen when scheduler tries to fetch the price
export async function validateSymbol(symbol: string): Promise<boolean> {
  // Basic symbol format validation
  if (!symbol || symbol.length < 1 || symbol.length > 20) {
    return false;
  }
  
  // Allow common formats: RELIANCE.NS, BTC-USD, AAPL, etc.
  const validPattern = /^[A-Za-z0-9.\-]+$/;
  return validPattern.test(symbol);
}
