'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Download, ShoppingBag, ZoomIn, FileQuestion } from 'lucide-react';
import { getPaddlePriceId } from '@/lib/paddle-tiers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/* ─── Lightbox Modal ────────────────────────────────────────────────────────── */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <img
        src={src}
        alt={alt}
        style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '16px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        ×
      </button>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
function ProductSkeleton({ isMobile }: { isMobile: boolean }) {
  const box = (h: string, w = '100%', r = '12px') => (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
  );
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', height: '62px' }} />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? '16px' : '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {box('0', '100%', '14px')}
            <div style={{ aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden' }}>
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {box('18px', '60%')}
              {box('14px')}
              {box('14px')}
              {box('14px', '80%')}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {box('22px', '70%')}
              {box('36px', '40%')}
              {box('46px')}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {box('16px')}
              {box('16px')}
              {box('16px')}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [paddleReady, setPaddleReady] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');
  const [paddleError, setPaddleError] = useState('');

  // ── TanStack Query — cached, deduplicated, background-refreshed ──
  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/products/${slug}`);
      if (!res.ok) throw new Error(`Product not found (${res.status})`);
      return res.json();
    },
    enabled: !!slug,
    staleTime: 3 * 60 * 1000,  // product data fresh for 3 min
    retry: 1,
  });

  // Initialize Paddle
  const initPaddle = useCallback(() => {
    if (typeof window === 'undefined') return;
    const Paddle = (window as any).Paddle;
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'test_abf9f446ddb33a5c02449b19bd1';
    if (Paddle && token) {
      Paddle.Environment.set('sandbox');
      Paddle.Initialize({
        token,
        eventCallback: (data: any) => {
          if (data.name === 'checkout.completed') {
            const txnId = data.data?.transaction_id || data.data?.id;
            router.push(`/success?txn=${txnId}`);
          }
        },
      });
      setPaddleReady(true);
    }
  }, [router]);

  useEffect(() => {
    initPaddle();
  }, [initPaddle]);

  const previewUrl = product?.previewImageKey
    ? `${API_BASE}/products/media/${product.previewImageKey}`
    : null;

  const openCheckout = useCallback(() => {
    if (!product) return;
    setPaddleError('');

    const priceId = getPaddlePriceId(product.price, product.paddlePriceId);

    if (!priceId) {
      setPaddleError(
        'This product does not have a valid Paddle Price ID attached. Please select a price tier in the Admin panel.'
      );
      return;
    }

    const Paddle = (window as any).Paddle;
    if (!Paddle) {
      setPaddleError('Payment system is loading, please try again in a moment.');
      return;
    }

    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'test_abf9f446ddb33a5c02449b19bd1';
    Paddle.Environment.set('sandbox');
    Paddle.Initialize({
      token,
      eventCallback: (data: any) => {
        if (data.name === 'checkout.completed') {
          const txnId = data.data?.transaction_id || data.data?.id;
          router.push(`/success?txn=${txnId}`);
        }
      },
    });

    setBuying(true);
    try {
      Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
      });
    } catch (err: any) {
      setPaddleError(err?.message || 'Failed to open checkout.');
    } finally {
      setBuying(false);
    }
  }, [product, router]);

  const handleFreeDownload = useCallback(async () => {
    if (!product) return;
    setDownloadMsg('Preparing download…');
    try {
      const res = await fetch(`${API_BASE}/downloads/free/${product.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.downloadUrl) {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = `${product.slug}.${product.fileFormat || 'dwg'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadMsg('');
      } else {
        setDownloadMsg('Could not get download link. Please try again.');
      }
    } catch {
      setDownloadMsg('Download failed. Please try again.');
    }
  }, [product]);

  if (isLoading) return <ProductSkeleton isMobile={isMobile} />;

  if (isError || !product) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#94a3b8' }}>
            <FileQuestion size={48} strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#334155' }}>Product not found</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>{(error as Error)?.message}</div>
          <Link href="/" style={{ color: '#2563eb', fontSize: '14px', marginTop: '16px', display: 'inline-block', fontWeight: 600 }}>← Back to catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      {/* Official Paddle Script */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={initPaddle}
      />

      {/* Lightbox Modal */}
      {lightboxSrc && <Lightbox src={lightboxSrc} alt={product.title} onClose={() => setLightboxSrc(null)} />}

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '16px', height: '62px' }}>
          <Link href="/" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '18px', color: '#1e293b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', width: '28px', height: '28px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '7px', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff' }}>⬡</span>
            CAD Marketplace
          </Link>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '13px', color: '#94a3b8' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 4px' }}>›</span>
            {product.category && (
              <>
                <Link href={`/?category=${product.category.slug}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>{product.category.name}</Link>
                <span style={{ margin: '0 4px' }}>›</span>
              </>
            )}
            <span style={{ color: '#475569', fontWeight: 500 }}>{product.title}</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? '16px' : '28px', alignItems: 'start' }}>

          {/* ─── Left: Image gallery + Description ─────────────────────────── */}
          <div>
            {/* Main Preview Image */}
            <div
              onClick={() => previewUrl && setLightboxSrc(previewUrl)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: previewUrl ? 'zoom-in' : 'default',
                marginBottom: '20px',
                position: 'relative',
              }}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={product.title}
                    loading="eager"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = 'none';
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', right: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ZoomIn size={12} /> Click to enlarge
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '80px', color: '#cbd5e1' }}>⬡</div>
              )}
            </div>

            {/* Description Card */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                {product.title} CAD drawings
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '14px', whiteSpace: 'pre-wrap', margin: 0 }}>
                {product.description || `High-quality ${product.fileFormat?.toUpperCase() || 'CAD'} block for architectural and design use. Clean vector lines and precise proportions.`}
              </p>
              {product.productTags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                  {product.productTags.map(({ tag }: any) => (
                    <Link key={tag.id} href={`/?tag=${tag.slug}`}
                      style={{ padding: '3px 10px', background: '#f1f5f9', borderRadius: '100px', fontSize: '12px', color: '#475569', fontWeight: 500, textDecoration: 'none' }}>
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: Info Sidebar (shown first on mobile) ─────────────────── */}
          {isMobile && (
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Price + CTA card (mobile) */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '12px' }}>{product.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    {product.isFree ? (
                      <span style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>Free</span>
                    ) : (
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>${Number(product.price).toFixed(2)} <span style={{ fontSize: '13px', color: '#94a3b8' }}>{product.currency || 'USD'}</span></span>
                    )}
                  </div>
                  {product.isFree ? (
                    <button onClick={handleFreeDownload} disabled={!!downloadMsg} style={{ padding: '11px 20px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: downloadMsg ? 'not-allowed' : 'pointer', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={15} />
                      {downloadMsg || 'Free Download'}
                    </button>
                  ) : (
                    <button onClick={openCheckout} disabled={buying} style={{ padding: '11px 20px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ShoppingBag size={15} />
                      {buying ? 'Opening…' : 'Buy Now'}
                    </button>
                  )}
                </div>
                {paddleError && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 10px', color: '#991b1b', fontSize: '12px', marginTop: '10px' }}>{paddleError}</div>}
              </div>
            </aside>
          )}

          {/* ─── Right: Info Sidebar (desktop only) ─────────────────────────── */}
          {!isMobile && (
            <aside style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Price + CTA card */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '16px' }}>
                  {product.title}
                </h1>

                {/* Price Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {product.isFree ? (
                    <span style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>Free</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a' }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{product.currency || 'USD'}</span>
                    </>
                  )}
                </div>

                {paddleError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', color: '#991b1b', fontSize: '12px', lineHeight: 1.5, marginBottom: '12px' }}>
                    {paddleError}
                  </div>
                )}

                {/* CTA Button */}
                {product.isFree ? (
                  <div>
                    <button onClick={handleFreeDownload} disabled={!!downloadMsg} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: downloadMsg ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.35)', opacity: downloadMsg ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Download size={17} />
                      {downloadMsg || 'Download Free'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <button onClick={openCheckout} disabled={buying} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ShoppingBag size={17} />
                      {buying ? 'Opening checkout…' : `Buy Now — $${Number(product.price).toFixed(2)}`}
                    </button>
                    <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px', lineHeight: 1.5 }}>
                      Secure payment via Paddle · Instant download
                    </p>
                  </div>
                )}
              </div>

              {/* File info card */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'File format', value: product.fileFormat ? `${product.fileFormat} (AutoCAD)` : null },
                    { label: 'CAD version', value: product.cadVersion },
                    { label: 'Category', value: product.category?.name },
                    { label: 'File size', value: product.fileSizeBytes ? `${(Number(product.fileSizeBytes) / 1024 / 1024).toFixed(1)} MB` : null },
                    { label: 'Downloads', value: product.downloadCount > 0 ? product.downloadCount.toLocaleString() : null },
                  ]
                    .filter((r) => r.value)
                    .map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>{label}:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
