'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, debouncedSearch],
    queryFn: () =>
      api.get(`/orders?page=${page}&limit=20${debouncedSearch ? `&search=${debouncedSearch}` : ''}`).then((r) => r.data),
  });

  function handleSearchChange(val: string) {
    setSearch(val);
    const timer = setTimeout(() => setDebouncedSearch(val), 400);
    return () => clearTimeout(timer);
  }

  const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
    PAID:     { bg: '#dcfce7', color: '#166534' },
    PENDING:  { bg: '#fef9c3', color: '#854d0e' },
    REFUNDED: { bg: '#fee2e2', color: '#991b1b' },
  };

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Orders</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search by email or order ID…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              padding: '9px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '9px',
              fontSize: '14px',
              width: '280px',
              outline: 'none',
            }}
          />
          {meta && (
            <span style={{ color: '#64748b', fontSize: '14px' }}>{meta.total} orders</span>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading orders…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o: any) => {
                  const sc = STATUS_COLOR[o.status] || STATUS_COLOR.PENDING;
                  return (
                    <tr key={o.id}>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                          {o.paddleOrderId || o.id.slice(0, 12) + '…'}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{o.email}</td>
                      <td>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.color,
                            padding: '3px 10px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {o.orderItems?.map((item: any) => item.product?.title).join(', ')}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {o.currency} {Number(o.totalAmount).toFixed(2)}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {meta && meta.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            <span>Page {meta.page} of {meta.totalPages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff' }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: page === meta.totalPages ? 'not-allowed' : 'pointer', background: '#fff' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
