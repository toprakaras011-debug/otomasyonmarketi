export const PLATFORM_FEE_PERCENTAGE = parseInt(
  process.env.PLATFORM_FEE_PERCENTAGE || '15',
  10
);

export function calculateFees(amount: number) {
  const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
  const developerEarnings = amount - platformFee;

  return {
    total: amount,
    platformFee: Math.round(platformFee * 100) / 100,
    developerEarnings: Math.round(developerEarnings * 100) / 100,
  };
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
