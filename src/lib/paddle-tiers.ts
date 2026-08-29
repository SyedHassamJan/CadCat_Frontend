export interface PriceTier {
  price: number;
  label: string;
  paddlePriceId: string;
}

export const PRICE_TIERS: PriceTier[] = [
  { price: 1.00,  label: '$1.00 (Test)', paddlePriceId: 'pri_01m176j83znjq5w0dw1g55877h' },
  { price: 3.00,  label: '$3.00',        paddlePriceId: 'pri_01m176nwjvvd9j90rbnyy4rz15' },
  { price: 5.00,  label: '$5.00',        paddlePriceId: 'pri_01m176qp2fj1em3nhbdsq6n7r5' },
  { price: 7.00,  label: '$7.00',        paddlePriceId: 'pri_01m176rfncjp5newj03w8mrwk4' },
  { price: 10.00, label: '$10.00',       paddlePriceId: 'pri_01m176sdh4drqwee96vbdw90b2' },
  { price: 15.00, label: '$15.00',       paddlePriceId: 'pri_01m176t1zesyk390ym1bbgwsav' },
  { price: 20.00, label: '$20.00',       paddlePriceId: 'pri_01m176vr4rh8jpb09nc5mt1zz1' },
  { price: 25.00, label: '$25.00',       paddlePriceId: 'pri_01m176wfp64qpskh6rbr6h1hbf' },
  { price: 30.00, label: '$30.00',       paddlePriceId: 'pri_01m176xy2jzsnhr9km48ve6ycv' },
];

export function getPaddlePriceId(price?: number | null, customId?: string | null): string | undefined {
  if (customId && customId.trim()) return customId.trim();
  if (!price) return undefined;
  const match = PRICE_TIERS.find((t) => t.price === Number(price));
  return match?.paddlePriceId;
}
