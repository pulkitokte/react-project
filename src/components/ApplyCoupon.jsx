import { useState } from "react";
import { validCoupons } from "../utils/coupons";
import { toast } from "react-toastify";

export default function ApplyCoupon({ onApply }) {
  const [code, setCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApply = () => {
    if (!code) return toast.error("Please enter a coupon code");

    const coupon = validCoupons.find(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase()
    );

    if (!coupon) return toast.error("❌ Invalid Coupon");

    const now = new Date();
    const expiry = new Date(coupon.expiryDate);

    if (expiry < now) return toast.error("⏰ Coupon has expired");
    if (coupon.usedCount >= coupon.usageLimit)
      return toast.error("🚫 Usage limit reached");

    //toast.success(`✅ ${coupon.code} Applied`);
    setAppliedCoupon(coupon);
    setCode(coupon.code);
    onApply(coupon); // Apply to CheckoutPage
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCode("");
    onApply(null); // Remove from CheckoutPage
    toast.info("🧾 Coupon removed");
  };

  return (
    <div className="mb-6">
      <label className="block font-medium mb-1">Promo Code</label>
      <div className="flex gap-2">
        <input
          type="text"
          className="border p-2 rounded w-full dark:bg-zinc-800"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!!appliedCoupon}
        />
        {appliedCoupon ? (
          <button
            onClick={handleRemove}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={handleApply}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Apply
          </button>
        )}
      </div>

      {/* Available Coupons */}
      <div className="mt-4 text-sm">
        <h4 className="font-semibold mb-2">Available Coupons:</h4>
        <ul className="space-y-2">
          {validCoupons.map((coupon) => {
            const isExpired = new Date(coupon.expiryDate) < new Date();
            const isUsedUp = coupon.usedCount >= coupon.usageLimit;
            return (
              <li
                key={coupon.code}
                className={`p-3 rounded border ${
                  isExpired || isUsedUp
                    ? "opacity-50 line-through"
                    : "border-green-400 bg-green-50 dark:bg-zinc-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-semibold text-green-700 dark:text-green-400">
                    {coupon.code}
                  </span>
                  {!isExpired && !isUsedUp && !appliedCoupon && (
                    <button
                      onClick={() => setCode(coupon.code)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Use
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {coupon.description}
                </p>
                <p className="text-xs text-gray-500">
                  Expires: {coupon.expiryDate} • Usage Left:{" "}
                  {coupon.usageLimit - coupon.usedCount}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
