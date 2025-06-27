'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState('Checking payment status...');

  useEffect(() => {
    const checkStatus = async () => {
      if (orderId) {
        const res = await fetch(`/api/verify-payment?order_id=${orderId}`);
        const data = await res.json();
        setStatus(data.status);
      }
    };
    checkStatus();
  }, [orderId]);

  return (
    <div>
      <h1>Payment Success</h1>
      <p>Order ID: {orderId}</p>
      <p>Status: {status}</p>
    </div>
  );
}
