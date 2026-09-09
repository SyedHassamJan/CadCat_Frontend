'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, FolderTree, Tag, ShoppingCart, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, admin, logout } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  /* ── Desktop sidebar ── */
  const DesktopSidebar = (
    <aside className="sidebar" style={{
      width: '240px',
      position: 'fixed',
      top: 0, left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--surface-200)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span className="logo-mark" style={{ fontSize: '13px', padding: '4px 8px', alignSelf: 'flex-start', boxShadow: '0 2px 8px rgba(198, 241, 53, 0.3)' }}>
            CAD Marketplace
          </span>
          <span style={{ color: 'var(--surface-600)', fontSize: '11px', fontWeight: 600, paddingLeft: '2px' }}>Admin Portal</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: 'var(--radius)',
              color: isActive ? 'var(--brand-900)' : 'var(--surface-700)',
              fontWeight: isActive ? 700 : 500, fontSize: '14px', textDecoration: 'none',
              background: isActive ? 'var(--brand-500)' : 'transparent',
              marginBottom: '2px', transition: 'all 0.15s',
              boxShadow: isActive ? '0 4px 10px rgba(198, 241, 53, 0.35)' : 'none',
            }}>
              <Icon size={16} style={{ opacity: isActive ? 1 : 0.8 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--surface-200)' }}>
        <div style={{ color: 'var(--surface-600)', fontSize: '11px', fontWeight: 500, marginBottom: '2px' }}>Signed in as</div>
        <div style={{ color: 'var(--surface-800)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', wordBreak: 'break-all' }}>{admin?.email}</div>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );

  /* ── Mobile drawer overlay ── */
  const MobileDrawer = sidebarOpen && (
    <>
      {/* Backdrop */}
      <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }} />
      {/* Drawer */}
      <aside className="sidebar" style={{ position: 'fixed', top: 0, left: 0, width: '260px', height: '100vh', zIndex: 999, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--surface-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="logo-mark" style={{ fontSize: '13px', padding: '4px 8px' }}>
            CAD Marketplace
          </span>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--surface-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: 'var(--radius)',
                color: isActive ? 'var(--brand-900)' : 'var(--surface-700)',
                fontWeight: isActive ? 700 : 500, fontSize: '15px', textDecoration: 'none',
                background: isActive ? 'var(--brand-500)' : 'transparent',
                marginBottom: '4px',
                boxShadow: isActive ? '0 4px 10px rgba(198, 241, 53, 0.35)' : 'none',
              }}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--surface-200)' }}>
          <div style={{ color: 'var(--surface-600)', fontSize: '11px', fontWeight: 500, marginBottom: '2px' }}>Signed in as</div>
          <div style={{ color: 'var(--surface-800)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', wordBreak: 'break-all' }}>{admin?.email}</div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );

  /* ── Mobile top bar ── */
  const MobileTopBar = (
    <header className="gradient-surface" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 90 }}>
      <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--brand-900)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}>
        <Menu size={20} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="logo-mark" style={{ fontSize: '12px', padding: '3px 8px' }}>
          CAD Marketplace
        </span>
      </div>
      <div style={{ width: '30px' }} /> {/* balance */}
    </header>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {!isMobile && DesktopSidebar}
      {isMobile && MobileTopBar}
      {isMobile && MobileDrawer}

      <main style={{
        marginLeft: isMobile ? 0 : '240px',
        marginTop: isMobile ? '52px' : 0,
        flex: 1,
        padding: isMobile ? '16px' : '28px',
        minHeight: '100vh',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}>
        {children}
      </main>
    </div>
  );
}
