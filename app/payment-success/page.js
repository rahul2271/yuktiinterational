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
        try {
          const res = await fetch(`/api/verify-payment?order_id=${orderId}`);
          const data = await res.json();
          setStatus(data.status);
        } catch (error) {
          console.error('Error checking payment status:', error);
          setStatus('Error fetching payment status');
        }
      }
    };
    checkStatus();
  }, [orderId]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Payment Success</h1>
      <p><strong>Order ID:</strong> {orderId}</p>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}

// ✅ Tell Next.js: This page is dynamic, don't prerender at build time
export const dynamic = 'force-dynamic';
