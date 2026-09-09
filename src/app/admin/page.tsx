'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

interface DashboardStats {
  totalProducts: number;
  freeProducts: number;
  paidProducts: number;
  totalOrders: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
}

function StatCard({
  label,
  value,
  sub,
  color = '#3b82f6',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{label}</div>
      <div
        style={{
          fontSize: '30px',
          fontWeight: 800,
          color: '#0f172a',
          fontFamily: "'Outfit', sans-serif",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: '12px', color: color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () =>
      api.get('/products/admin/dashboard/stats').then((r) => r.data),
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Overview of your CAD Marketplace performance.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '14px' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          <StatCard label="Published Products" value={stats?.totalProducts ?? 0} />
          <StatCard label="Free Products" value={stats?.freeProducts ?? 0} color="#10b981" sub="Free downloads" />
          <StatCard label="Paid Products" value={stats?.paidProducts ?? 0} color="#8b5cf6" sub="For purchase" />
          <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
          <StatCard
            label="Revenue This Month"
            value={`$${Number(stats?.revenueThisMonth ?? 0).toFixed(2)}`}
            color="#f59e0b"
            sub="USD"
          />
          <StatCard label="Orders This Month" value={stats?.ordersThisMonth ?? 0} />
        </div>
      )}

      {/* Quick links */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--surface-900)', marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/admin/products/new" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }}>
            + New Product
          </Link>
          <Link href="/admin/categories" className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '14px' }}>
            Manage Categories
          </Link>
          <Link href="/admin/tags" className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '14px' }}>
            Manage Tags
          </Link>
          <Link href="/admin/orders" className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '14px' }}>
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
