export interface OrderPriceLine {
  price: number;
  quantity: number;
}

export function calculateOrderTotals(
  lines: readonly OrderPriceLine[],
  standardShippingFee: number,
  freeShippingThreshold: number
) {
  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  return {
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee,
  };
}
