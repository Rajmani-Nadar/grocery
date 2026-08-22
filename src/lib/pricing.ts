export interface Pricing {
  subtotal: number
  shipping: number
  tax: number
  total: number
  freeShipping: boolean
}

export function calculatePricing(subtotal: number): Pricing {
  const normalizedSubtotal = Number(subtotal.toFixed(2))
  const freeShipping = normalizedSubtotal >= 500
  const shipping = freeShipping ? 0 : 50
  const tax = Number((normalizedSubtotal * 0.05).toFixed(2))
  const total = Number((normalizedSubtotal + shipping + tax).toFixed(2))

  return {
    subtotal: normalizedSubtotal,
    shipping,
    tax,
    total,
    freeShipping,
  }
}
