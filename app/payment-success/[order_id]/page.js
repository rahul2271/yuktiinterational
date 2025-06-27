'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccess() {
  const { order_id } = useParams();
  const [status, setStatus] = useState('Checking payment status...');

  useEffect(() => {
    const checkStatus = async () => {
      if (order_id) {
        try {
          const res = await fetch(`/api/verify-payment?order_id=${order_id}`);
          const data = await res.json();
          setStatus(data.status);
        } catch (error) {
          console.error('Error fetching status:', error);
          setStatus('Error fetching payment status');
        }
      }
    };
    checkStatus();
  }, [order_id]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Payment Success</h1>
      <p><strong>Order ID:</strong> {order_id}</p>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}
