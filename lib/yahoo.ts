import yahooFinance from 'yahoo-finance2';

export async function validateSymbol(symbol: string): Promise<boolean> {
  try {
    await yahooFinance.quote(symbol, {}, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
