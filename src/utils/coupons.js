// utils/coupons.js
export const validCoupons = [
  {
    code: "NEWUSER10",
    discountType: "percentage",
    discountValue: 10,
    expiryDate: "2025-12-31",
    usageLimit: 100,
    usedCount: 0,
    description: "10% off for new users",
  },
  {
    code: "FLAT100",
    discountType: "fixed",
    discountValue: 100,
    expiryDate: "2025-11-30",
    usageLimit: 50,
    usedCount: 0,
    description: "₹100 off on orders above ₹999",
  },
];
