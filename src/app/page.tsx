'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Layers } from 'lucide-react';
import api from '@/lib/api';

const FORMATS = ['dwg', 'dxf', 'skp', 'rvt', 'ifc', 'step', '3ds', 'max'];

export default function HomePage() {
  const [filters, setFilters] = useState({
    category: '',
    format: '',
    isFree: '',
    sort: 'newest',
    page: 1,
    search: '',
  });
  const [isMobile, setIsMobile] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  // Prefetch product detail on card hover — makes navigation feel instant
  const prefetchProduct = useCallback((slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', slug],
      queryFn: async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products/${slug}`);
        if (!res.ok) throw new Error('Not found');
        return res.json();
      },
      staleTime: 3 * 60 * 1000,
    });
  }, [queryClient]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'home', filters],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: '24',
        sort: filters.sort,
        ...(filters.category && { category: filters.category }),
        ...(filters.format && { format: filters.format }),
        ...(filters.isFree && { isFree: filters.isFree }),
        ...(filters.search && { q: filters.search }),
      });
      return api.get(`/products?${params}`).then((r) => r.data);
    },
  });

  const products = data?.data ?? [];
  const meta = data?.meta;
  const cats = Array.isArray(categories) ? categories : [];

  function setFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  const FilterPanel = (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
      {/* Format */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Format</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          <button onClick={() => setFilter('format', '')} style={{ padding: '3px 10px', borderRadius: '100px', border: '1px solid ' + (!filters.format ? '#2563eb' : '#e2e8f0'), background: !filters.format ? '#eff6ff' : '#fff', color: !filters.format ? '#2563eb' : '#64748b', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>All</button>
          {FORMATS.map((fmt) => (
            <button key={fmt} onClick={() => setFilter('format', fmt)} style={{ padding: '3px 10px', borderRadius: '100px', border: '1px solid ' + (filters.format === fmt ? '#2563eb' : '#e2e8f0'), background: filters.format === fmt ? '#eff6ff' : '#fff', color: filters.format === fmt ? '#2563eb' : '#64748b', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>{fmt}</button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price</div>
        {[{ label: 'All', value: '' }, { label: 'Free', value: 'true' }, { label: 'Paid', value: 'false' }].map(({ label, value }) => (
          <button key={value} onClick={() => setFilter('isFree', value)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: '8px', background: filters.isFree === value ? '#eff6ff' : 'transparent', color: filters.isFree === value ? '#2563eb' : '#475569', border: 'none', cursor: 'pointer', fontWeight: filters.isFree === value ? 600 : 400, fontSize: '13px', marginBottom: '2px' }}>{label}</button>
        ))}
      </div>

      {/* Sort */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort By</div>
        <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#334155', outline: 'none', background: '#fff' }}>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="downloads">Most Downloaded</option>
        </select>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', height: '58px' }}>
          {/* Logo */}
          <Link href="/" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? '16px' : '20px', color: '#1e293b', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ display: 'inline-flex', width: '30px', height: '30px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff' }}>⬡</span>
            {!isMobile && 'CAD Marketplace'}
          </Link>

          {/* Search bar */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={isMobile ? 'Search CAD blocks...' : 'Search CAD blocks, furniture, architecture...'}
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>

          {/* Mobile filter toggle */}
          {isMobile && (
            <button
              onClick={() => setFilterOpen(f => !f)}
              style={{ padding: '8px 12px', borderRadius: '9px', border: '1px solid #e2e8f0', background: filterOpen ? '#2563eb' : '#fff', color: filterOpen ? '#fff' : '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <SlidersHorizontal size={13} /> Filter
            </button>
          )}
        </div>
      </header>

      {/* Mobile filter panel (expandable) */}
      {isMobile && filterOpen && (
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
          {FilterPanel}
        </div>
      )}

      {/* Category strip */}
      {cats.length > 0 && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px', display: 'flex', gap: '4px', height: '46px', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <button onClick={() => setFilter('category', '')} style={{ padding: '5px 14px', borderRadius: '100px', border: 'none', background: !filters.category ? '#2563eb' : 'transparent', color: !filters.category ? '#fff' : '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>All</button>
            {cats.map((c: any) => (
              <button key={c.id} onClick={() => setFilter('category', c.slug)} style={{ padding: '5px 14px', borderRadius: '100px', border: 'none', background: filters.category === c.slug ? '#2563eb' : 'transparent', color: filters.category === c.slug ? '#fff' : '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main layout: sidebar + grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '16px' : '24px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '200px 1fr', gap: isMobile ? '0' : '24px', alignItems: 'start' }}>
        {/* Sidebar — desktop only */}
        {!isMobile && (
          <aside>
            <div style={{ position: 'sticky', top: '115px' }}>
              {FilterPanel}
            </div>
          </aside>
        )}

        {/* Product grid */}
        <main>
          {/* Results count */}
          {meta && (
            <div style={{ marginBottom: '14px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              {meta.total ?? 0} block{meta.total !== 1 ? 's' : ''} found
              {filters.category && cats.find((c: any) => c.slug === filters.category) && ` in ${cats.find((c: any) => c.slug === filters.category).name}`}
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? '12px' : '16px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ height: '220px', borderRadius: '12px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#94a3b8' }}>
                <Layers size={48} strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>No blocks found</div>
              <div style={{ fontSize: '14px' }}>Try adjusting your filters or search term</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: isMobile ? '12px' : '20px' }}>
                {products.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}
                    onMouseEnter={() => prefetchProduct(p.slug)}
                    onFocus={() => prefetchProduct(p.slug)}
                  >
                    <div
                      style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.18s ease', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; el.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; el.style.transform = 'translateY(0)'; }}
                    >
                      {/* Image with price badge */}
                      <div style={{ aspectRatio: '4/3', background: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {p.thumbnailKey ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products/media/${p.thumbnailKey}`}
                            alt={p.title}
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                          />
                        ) : (
                          <div style={{ fontSize: '42px', color: '#cbd5e1' }}>⬡</div>
                        )}
                        {/* Price badge */}
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: p.isFree ? '#22c55e' : '#2563eb', color: '#fff', padding: '3px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                          {p.isFree ? 'Free' : `$${Number(p.price).toFixed(0)}`}
                        </div>
                        {/* Format badge */}
                        {p.fileFormat && (
                          <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,255,255,0.92)', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', border: '1px solid #e2e8f0' }}>
                            {p.fileFormat}
                          </div>
                        )}
                      </div>

                      {/* Card footer */}
                      <div style={{ padding: isMobile ? '8px 10px 10px' : '12px 14px 14px' }}>
                        <div style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 700, color: '#1e293b', lineHeight: 1.4, marginBottom: '3px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                          {p.title}
                        </div>
                        {p.category && (
                          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 500 }}>
                            {p.category.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '36px' }}>
                  <button onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filters.page === 1} style={{ padding: isMobile ? '8px 14px' : '8px 20px', border: '1px solid #e2e8f0', borderRadius: '9px', background: '#fff', cursor: filters.page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: filters.page === 1 ? 0.5 : 1 }}>← Prev</button>
                  <span style={{ fontSize: '13px', color: '#64748b', padding: '0 8px' }}>Page {filters.page} of {meta.totalPages}</span>
                  <button onClick={() => setFilters((f) => ({ ...f, page: Math.min(meta.totalPages, f.page + 1) }))} disabled={filters.page === meta.totalPages} style={{ padding: isMobile ? '8px 14px' : '8px 20px', border: '1px solid #e2e8f0', borderRadius: '9px', background: '#fff', cursor: filters.page === meta.totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: filters.page === meta.totalPages ? 0.5 : 1 }}>Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
