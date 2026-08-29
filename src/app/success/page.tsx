'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function SuccessContent() {
  const searchParams = useSearchParams();
  const txn = searchParams.get('txn') || searchParams.get('order_id') || searchParams.get('orderId');
  const productSlug = searchParams.get('product');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setLoading(false);
        return true;
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => {
    if (!txn) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
      attempts++;
      const success = await fetchOrder(txn);
      if (success || attempts >= maxAttempts) {
        clearInterval(interval);
        setLoading(false);
        if (!success && attempts >= maxAttempts) {
          setError('Order confirmation is taking a few moments. If your payment went through, your download will be available shortly.');
        }
      }
    }, 2000);

    // Run first check immediately
    fetchOrder(txn);

    return () => clearInterval(interval);
  }, [txn, fetchOrder]);

  async function handleDownload(orderId: string, productId: string, slug: string, format?: string) {
    setDownloadingId(productId);
    try {
      const res = await fetch(`${API_BASE}/downloads/paid/${orderId}/${productId}`, { method: 'POST' });
      const data = await res.json();
      if (data.downloadUrl) {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = `${slug}.${format || 'dwg'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert(data.message || 'Download authorization failed. Please try again.');
      }
    } catch {
      alert('Could not download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '22px', color: '#1e293b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', width: '32px', height: '32px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff' }}>⬡</span>
            CAD Marketplace
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          
          {/* Header icon */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#16a34a', marginBottom: '16px' }}>
              ✓
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Payment Successful!
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Thank you for your purchase. Your CAD drawing is ready to download.
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '14px' }}>
              <div style={{ marginBottom: '8px' }}>Confirming order with payment provider…</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Please wait a few seconds.</div>
            </div>
          )}

          {/* Error fallback */}
          {error && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', color: '#92400e', fontSize: '13px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Purchased Items List */}
          {order?.orderItems && order.orderItems.length > 0 && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '10px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                Your Files
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.orderItems.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>
                        {item.product.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Format: <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#2563eb' }}>{item.product.fileFormat || 'DWG'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(order.id, item.product.id, item.product.slug, item.product.fileFormat)}
                      disabled={downloadingId === item.product.id}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '9px',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: downloadingId === item.product.id ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {downloadingId === item.product.id ? 'Preparing…' : '⬇ Download File'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If accessed with slug but without order record yet */}
          {!loading && !order && productSlug && (
            <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <p style={{ color: '#475569', fontSize: '14px', marginBottom: '14px' }}>
                Your order is processed. You can return to the catalogue or browse more blocks.
              </p>
              <Link
                href={`/product/${productSlug}`}
                style={{
                  display: 'inline-block',
                  padding: '10px 22px',
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: '9px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                View Product
              </Link>
            </div>
          )}

          {/* Footer action */}
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              ← Back to CAD Marketplace
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
