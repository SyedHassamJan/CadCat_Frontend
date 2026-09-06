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
    <aside style={{
      width: '240px',
      background: '#0f172a',
      position: 'fixed',
      top: 0, left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff', flexShrink: 0 }}>⬡</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>CAD Marketplace</div>
            <div style={{ color: '#475569', fontSize: '11px' }}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px',
              color: isActive ? '#fff' : '#94a3b8',
              fontWeight: 500, fontSize: '14px', textDecoration: 'none',
              background: isActive ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'transparent',
              marginBottom: '2px', transition: 'all 0.15s',
              boxShadow: isActive ? '0 4px 10px rgba(59,130,246,0.3)' : 'none',
            }}>
              <Icon size={16} style={{ opacity: 0.85 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Signed in as</div>
        <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '10px', wordBreak: 'break-all' }}>{admin?.email}</div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </aside>
  );

  /* ── Mobile drawer overlay ── */
  const MobileDrawer = sidebarOpen && (
    <>
      {/* Backdrop */}
      <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
      {/* Drawer */}
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '260px', height: '100vh', background: '#0f172a', zIndex: 999, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>⬡</div>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '13px' }}>CAD Marketplace</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '8px',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: 500, fontSize: '15px', textDecoration: 'none',
                background: isActive ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'transparent',
                marginBottom: '4px',
              }}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Signed in as</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px', wordBreak: 'break-all' }}>{admin?.email}</div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#fca5a5', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );

  /* ── Mobile top bar ── */
  const MobileTopBar = (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 90, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}>
        <Menu size={20} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>⬡</div>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px' }}>Admin</span>
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
