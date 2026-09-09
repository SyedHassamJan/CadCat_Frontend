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
  color = 'var(--brand-500)',
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
        border: '1px solid var(--surface-200)',
        borderRadius: '14px',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--brand-400)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surface-200)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ fontSize: '11px', color: 'var(--surface-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: 800,
          color: 'var(--brand-900)',
          fontFamily: "'Outfit', sans-serif",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: color, fontWeight: 600, marginTop: '2px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
          {sub}
        </div>
      )}
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
        <div className="accent-label" style={{ marginBottom: '8px' }}>Admin Overview</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-900)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--surface-600)', fontSize: '14px' }}>
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
        <div className="accent-label" style={{ marginBottom: '14px' }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/admin/products/new" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
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
