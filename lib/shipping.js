/**
 * Shipping rules for the storefront.
 *
 * The backend is what actually charges the customer
 * (SHIPPING_THRESHOLD / SHIPPING_CHARGE in backend/src/routes/order.js).
 * These values mirror it so the cart, checkout and all the marketing copy
 * show the same numbers — keep the two in sync when changing them.
 */
export const SHIPPING_THRESHOLD = 400;
export const SHIPPING_CHARGE = 100;

/** Shipping charged for a cart subtotal. Free at or above the threshold. */
export const calcShipping = (subtotal) =>
  Number(subtotal) > 0 && Number(subtotal) < SHIPPING_THRESHOLD ? SHIPPING_CHARGE : 0;

/** How much more to spend to unlock free shipping (0 when already free). */
export const freeShippingGap = (subtotal) =>
  Math.max(0, SHIPPING_THRESHOLD - Number(subtotal || 0));
