'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/api';

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  PUBLISHED: { label: 'Published', bg: '#dcfce7', color: '#166534' },
  DRAFT:     { label: 'Draft',     bg: '#fef9c3', color: '#854d0e' },
  ARCHIVED:  { label: 'Archived',  bg: '#fee2e2', color: '#991b1b' },
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => api.get(`/products/admin/list?page=${page}&limit=20`).then((r) => r.data),
  });

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete or archive "${title}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      refetch();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error deleting product');
    }
  }

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Products</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {meta ? `${meta.total} products total` : 'Loading...'}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            padding: '10px 18px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
          }}
        >
          + New Product
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading products…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Type</th>
                <th>Format</th>
                <th>Price</th>
                <th>Downloads</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No products yet.{' '}
                    <Link href="/admin/products/new" style={{ color: '#3b82f6', fontWeight: 600 }}>
                      Add one
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((p: any) => {
                  const badge = STATUS_BADGE[p.status] || STATUS_BADGE.DRAFT;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, maxWidth: '240px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{p.slug}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            padding: '3px 10px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: p.isFree ? '#d1fae5' : '#ede9fe',
                            color: p.isFree ? '#065f46' : '#5b21b6',
                            padding: '3px 10px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {p.isFree ? 'Free' : 'Paid'}
                        </span>
                      </td>
                      <td>
                        {p.fileFormat ? (
                          <span
                            style={{
                              background: '#e0f2fe',
                              color: '#075985',
                              padding: '3px 10px',
                              borderRadius: '100px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                          >
                            {p.fileFormat}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: p.isFree ? '#10b981' : '#0f172a', fontWeight: 500 }}>
                        {p.isFree ? 'Free' : `$${Number(p.price || 0).toFixed(2)}`}
                      </td>
                      <td style={{ color: '#64748b' }}>{p.downloadCount}</td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            href={`/admin/products/${p.id}`}
                            style={{
                              padding: '5px 12px',
                              background: '#f1f5f9',
                              color: '#334155',
                              borderRadius: '7px',
                              fontSize: '13px',
                              fontWeight: 500,
                              textDecoration: 'none',
                            }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            style={{
                              padding: '5px 12px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '7px',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} products)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '7px',
                  background: page === 1 ? '#f8fafc' : '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  color: page === 1 ? '#cbd5e1' : '#334155',
                  fontWeight: 500,
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                style={{
                  padding: '6px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '7px',
                  background: page === meta.totalPages ? '#f8fafc' : '#fff',
                  cursor: page === meta.totalPages ? 'not-allowed' : 'pointer',
                  color: page === meta.totalPages ? '#cbd5e1' : '#334155',
                  fontWeight: 500,
                }}
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
