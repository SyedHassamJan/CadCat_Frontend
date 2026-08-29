'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '▤', exact: true },
  { href: '/admin/products', label: 'Products', icon: '⬚' },
  { href: '/admin/categories', label: 'Categories', icon: '◫' },
  { href: '/admin/tags', label: 'Tags', icon: '◈' },
  { href: '/admin/orders', label: 'Orders', icon: '◱' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, admin, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  // Login page renders without sidebar
  if (pathname === '/admin/login') return <>{children}</>;
  if (!isAuthenticated) return null;

  function handleLogout() {
    logout();
    router.replace('/admin/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          background: '#0f172a',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(59,130,246,0.4)',
                flexShrink: 0,
              }}
            >
              ⬡
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>
                CAD Marketplace
              </div>
              <div style={{ color: '#475569', fontSize: '11px' }}>Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map(({ href, label, icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontWeight: 500,
                  fontSize: '14px',
                  textDecoration: 'none',
                  background: isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                  marginBottom: '2px',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 4px 10px rgba(59,130,246,0.3)' : 'none',
                }}
              >
                <span style={{ fontSize: '16px', opacity: 0.85 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>
            Signed in as
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '10px', wordBreak: 'break-all' }}>
            {admin?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '28px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
