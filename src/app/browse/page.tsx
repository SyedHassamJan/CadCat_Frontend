'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import api from '@/lib/api';

const FORMATS = ['dwg', 'dxf', 'skp', 'rvt', 'ifc', 'step', '3ds', 'max'];

export default function BrowsePage() {
  const [filters, setFilters] = useState({
    category: '',
    format: '',
    isFree: '',
    sort: 'newest',
    page: 1,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'browse', filters],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: '24',
        sort: filters.sort,
        ...(filters.category && { category: filters.category }),
        ...(filters.format && { format: filters.format }),
        ...(filters.isFree && { isFree: filters.isFree }),
      });
      return api.get(`/products?${params}`).then((r) => r.data);
    },
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  function setFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  const cats = Array.isArray(categories) ? categories : [];

  return (
    <>
      {/* Nav */}
      <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '24px', height: '60px' }}>
          <Link href="/" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#0f172a', textDecoration: 'none' }}>
            ⬡ CAD Marketplace
          </Link>
          <nav style={{ display: 'flex', gap: '4px' }}>
            <Link href="/browse" style={{ padding: '6px 14px', borderRadius: '8px', color: '#2563eb', fontWeight: 600, fontSize: '14px', textDecoration: 'none', background: '#eff6ff' }}>Browse</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px' }}>
        {/* Sidebar filters */}
        <aside>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', position: 'sticky', top: '76px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Filters
            </h2>

            {/* Category */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
              <button
                onClick={() => setFilter('category', '')}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: '7px', background: !filters.category ? '#eff6ff' : 'transparent', color: !filters.category ? '#2563eb' : '#475569', border: 'none', cursor: 'pointer', fontWeight: !filters.category ? 600 : 400, fontSize: '14px', marginBottom: '2px' }}
              >
                All Categories
              </button>
              {cats.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setFilter('category', c.slug)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: '7px', background: filters.category === c.slug ? '#eff6ff' : 'transparent', color: filters.category === c.slug ? '#2563eb' : '#475569', border: 'none', cursor: 'pointer', fontWeight: filters.category === c.slug ? 600 : 400, fontSize: '14px', marginBottom: '2px' }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Format */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Format</div>
              <button
                onClick={() => setFilter('format', '')}
                style={{ padding: '4px 12px', borderRadius: '100px', border: '1px solid ' + (!filters.format ? '#93c5fd' : '#e2e8f0'), background: !filters.format ? '#dbeafe' : '#fff', color: !filters.format ? '#1d4ed8' : '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginRight: '6px', marginBottom: '6px' }}
              >
                All
              </button>
              {FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFilter('format', fmt)}
                  style={{ padding: '4px 12px', borderRadius: '100px', border: '1px solid ' + (filters.format === fmt ? '#93c5fd' : '#e2e8f0'), background: filters.format === fmt ? '#dbeafe' : '#fff', color: filters.format === fmt ? '#1d4ed8' : '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginRight: '6px', marginBottom: '6px', textTransform: 'uppercase' }}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Type */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
              {[{ label: 'All', value: '' }, { label: 'Free', value: 'true' }, { label: 'Paid', value: 'false' }].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setFilter('isFree', value)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: '7px', background: filters.isFree === value ? '#eff6ff' : 'transparent', color: filters.isFree === value ? '#2563eb' : '#475569', border: 'none', cursor: 'pointer', fontWeight: filters.isFree === value ? 600 : 400, fontSize: '14px', marginBottom: '2px' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort By</div>
              <select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#334155', outline: 'none' }}
              >
                <option value="newest">Newest</option>
                <option value="name">Name A–Z</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '14px' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#94a3b8' }}>
                <Search size={44} strokeWidth={1.5} />
              </div>
              No products match your filters.
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {products.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                        ⬡
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '7px', flexWrap: 'wrap' }}>
                          <span style={{ background: p.isFree ? '#d1fae5' : '#ede9fe', color: p.isFree ? '#065f46' : '#5b21b6', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>
                            {p.isFree ? 'FREE' : `$${Number(p.price).toFixed(2)}`}
                          </span>
                          {p.fileFormat && (
                            <span style={{ background: '#e0f2fe', color: '#075985', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                              {p.fileFormat}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '4px' }}>
                          {p.title}
                        </div>
                        {p.category && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.category.name}</div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '36px' }}>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                    disabled={filters.page === 1}
                    style={{ padding: '8px 20px', border: '1px solid #e2e8f0', borderRadius: '9px', background: '#fff', cursor: filters.page === 1 ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                  >
                    ← Previous
                  </button>
                  <span style={{ padding: '8px 16px', color: '#64748b', fontSize: '14px' }}>
                    {filters.page} / {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.min(meta.totalPages, f.page + 1) }))}
                    disabled={filters.page === meta.totalPages}
                    style={{ padding: '8px 20px', border: '1px solid #e2e8f0', borderRadius: '9px', background: '#fff', cursor: filters.page === meta.totalPages ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
