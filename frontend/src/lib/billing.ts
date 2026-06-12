export interface BillingDetails {
  nights: number;
  baseAmount: number;
  netTaxable: number;
  taxTotal: number;
  taxRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}

/**
 * Calculates pricing, duration, and taxes for a stay based on local Indian GST laws.
 * @param basePrice The base price of the room per night.
 * @param checkIn The check-in date string (e.g. 'YYYY-MM-DD').
 * @param checkOut The check-out date string (e.g. 'YYYY-MM-DD').
 * @param discount Any applicable coupon discount amount.
 * @param stateCode The 2-letter state code of the guest for GST splits.
 * @returns BillingDetails containing all tax splits and totals.
 */
export function calculateStayPricing(
  basePrice: number,
  checkIn: string,
  checkOut: string,
  discount: number,
  stateCode: string
): BillingDetails {
  // Calculate nights
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  const baseAmount = basePrice * nights;
  const netTaxable = Math.max(0, baseAmount - discount);
  
  // GST Slabs: 12% if daily tariff < ₹7500, 18% otherwise
  const dailyPrice = netTaxable / nights;
  const taxRate = dailyPrice < 7500 ? 0.12 : 0.18;
  const taxTotal = netTaxable * taxRate;
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (stateCode === 'GA') {
    cgst = taxTotal / 2;
    sgst = taxTotal / 2;
  } else {
    igst = taxTotal;
  }

  return {
    nights,
    baseAmount,
    netTaxable,
    taxTotal,
    taxRate,
    cgst,
    sgst,
    igst,
    grandTotal: netTaxable + taxTotal,
  };
}
