export function multiplyDecimal(price: string, quantity: number): string {
  const [int = '0', frac = '0'] = price.split('.');
  const cents =
    parseInt(int, 10) * 100 + parseInt((frac + '00').slice(0, 2) || '0', 10);
  const totalCents = cents * quantity;
  const sign = totalCents < 0 ? '-' : '';
  const abs = Math.abs(totalCents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
