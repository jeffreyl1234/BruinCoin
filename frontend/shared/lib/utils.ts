// Shared utilities that work for both web and mobile
// Note: clsx and tailwind-merge are web-specific, so we'll create a simpler version

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

// You can add more shared utilities here
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
