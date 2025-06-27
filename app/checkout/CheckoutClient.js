'use client';

import { useSearchParams } from 'next/navigation';

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div>
      <h1>Checkout Page</h1>
      <p>Order ID: {orderId}</p>
    </div>
  );
}
