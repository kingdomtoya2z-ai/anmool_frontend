/**
 * Shipping rules for the storefront.
 *
 * The backend is what actually charges the customer
 * (backend/src/routes/order.js). These values mirror it so the cart, checkout
 * and all the marketing copy show the same numbers — keep the two in sync
 * when changing them.
 */
export const SHIPPING_THRESHOLD = 400;
export const LIGHT_ITEM_SHIPPING = 60; // products under 1kg
export const HEAVY_ITEM_SHIPPING = 100; // products 1kg and above
// Kept for any copy that still refers to the heavier-item rate.
export const SHIPPING_CHARGE = HEAVY_ITEM_SHIPPING;

/** Read a product's weight (e.g. "500g", "1.5 kg", "1kg") as kilograms. */
export const parseWeightKg = (value) => {
  if (value == null) return 0;
  const text = String(value).toLowerCase().replace(/,/g, '.').trim();
  const kg = text.match(/(\d+(?:\.\d+)?)\s*(?:kgs?|kilograms?)\b/);
  if (kg) return parseFloat(kg[1]);
  const g = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gms?|grams?)\b/);
  if (g) return parseFloat(g[1]) / 1000;
  // A bare number is treated as kilograms (e.g. weight: "1")
  if (/^\d+(?:\.\d+)?$/.test(text)) return parseFloat(text);
  return 0;
};

/**
 * Shipping charged for a cart. Free at or above the threshold. Below it, every
 * unit is charged by its own weight: under 1kg => ₹60, 1kg or more => ₹100.
 */
export const calcShipping = (subtotal, items = []) => {
  const amount = Number(subtotal);
  if (!(amount > 0) || amount >= SHIPPING_THRESHOLD) return 0;
  return items.reduce((sum, item) => {
    const weightKg = Number.isFinite(Number(item.weightKg))
      ? Number(item.weightKg)
      : parseWeightKg(item.weight || item.unit);
    const perUnit = weightKg >= 1 ? HEAVY_ITEM_SHIPPING : LIGHT_ITEM_SHIPPING;
    return sum + perUnit * Math.max(1, Math.floor(Number(item.quantity) || 1));
  }, 0);
};

/** How much more to spend to unlock free shipping (0 when already free). */
export const freeShippingGap = (subtotal) =>
  Math.max(0, SHIPPING_THRESHOLD - Number(subtotal || 0));
