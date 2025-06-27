'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const paymentSessionId = searchParams.get('payment_session_id');

  useEffect(() => {
    if (paymentSessionId) {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        const cashfree = window.Cashfree({
          mode: 'production'  // Change to 'sandbox' if using test keys
        });

        cashfree.checkout({
          paymentSessionId,
          redirectTarget: '_self'  // Open checkout in same tab
        });
      };
      document.body.appendChild(script);
    }
  }, [paymentSessionId]);

  if (!paymentSessionId) {
    return <p>Error: Missing payment session ID.</p>;
  }

  return (
    <div>
      <h1>Redirecting to payment...</h1>
    </div>
  );
}
