'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { PRICE_TIERS } from '@/lib/paddle-tiers';

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; }

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const cadFileRef = useRef<HTMLInputElement>(null);
  const previewRef  = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    isFree: true,
    price: '',
    currency: 'USD',
    fileFormat: 'dwg',
    cadVersion: '',
    status: 'DRAFT',
    paddlePriceId: '',
    tagIds: [] as string[],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: tags } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/products', data).then((r) => r.data),
    onSuccess: async (product) => {
      setCreatedId(product.id);

      // Upload files if selected
      const cadFile    = cadFileRef.current?.files?.[0];
      const previewImg = previewRef.current?.files?.[0];

      if (cadFile || previewImg) {
        const fd = new FormData();
        if (cadFile)    fd.append('cadFile',      cadFile);
        if (previewImg) fd.append('previewImage',  previewImg);

        try {
          await api.post(`/products/${product.id}/media`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to upload files');
          return;
        }
      }

      setSuccess('Product created successfully!');
      setTimeout(() => router.push('/admin/products'), 1500);
    },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create product'),
  });

  function toggleTag(id: string) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter((t) => t !== id) : [...f.tagIds, id],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    createMutation.mutate({
      ...form,
      price: form.isFree ? undefined : parseFloat(form.price) || undefined,
    });
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '9px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties;

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px',
  } as React.CSSProperties;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="accent-label" style={{ marginBottom: '8px' }}>Catalogue</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-900)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
          New Product
        </h1>
        <p style={{ color: 'var(--surface-600)', fontSize: '14px' }}>
          Upload and configure your CAD block or drawing for the marketplace.
        </p>
      </div>

      {success && (
        <div
          style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '10px',
            padding: '14px',
            color: '#065f46',
            fontWeight: 600,
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {success}
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '10px',
            padding: '14px',
            color: '#991b1b',
            fontWeight: 600,
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gap: '20px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '-8px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            Basic Information
          </h2>

          <div>
            <label style={labelStyle}>Title *</label>
            <input
              style={inputStyle}
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Modern Chair Collection DWG"
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the CAD block pack, what's included, layers, etc."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                style={{ ...inputStyle }}
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">— No category —</option>
                {(categories as Category[] | undefined)?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>CAD Format</label>
              <select
                style={{ ...inputStyle }}
                value={form.fileFormat}
                onChange={(e) => setForm((f) => ({ ...f, fileFormat: e.target.value }))}
              >
                {['dwg', 'dxf', 'skp', 'rvt', 'ifc', 'step', '3ds', 'max'].map((fmt) => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>CAD Version</label>
              <input
                style={inputStyle}
                type="text"
                value={form.cadVersion}
                onChange={(e) => setForm((f) => ({ ...f, cadVersion: e.target.value }))}
                placeholder="e.g. AutoCAD 2020"
              />
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select
                style={{ ...inputStyle }}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Pricing</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  border: '1px solid ' + (form.isFree ? '#6ee7b7' : '#e2e8f0'),
                  borderRadius: '9px',
                  background: form.isFree ? '#d1fae5' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  checked={form.isFree}
                  onChange={() => setForm((f) => ({ ...f, isFree: true, price: '', paddlePriceId: '' }))}
                />
                <span style={{ fontWeight: 600, fontSize: '14px', color: form.isFree ? '#065f46' : '#64748b' }}>
                  Free
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  border: '1px solid ' + (!form.isFree ? '#a78bfa' : '#e2e8f0'),
                  borderRadius: '9px',
                  background: !form.isFree ? '#ede9fe' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  checked={!form.isFree}
                  onChange={() => {
                    const defaultTier = PRICE_TIERS[1]; // $5.00 default
                    setForm((f) => ({ ...f, isFree: false, price: String(defaultTier.price), paddlePriceId: defaultTier.paddlePriceId }));
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: '14px', color: !form.isFree ? '#5b21b6' : '#64748b' }}>
                  Paid
                </span>
              </label>
            </div>

            {!form.isFree && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>Select Price Tier (Paddle Auto-Connected):</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {PRICE_TIERS.map((tier) => {
                    const isSelected = Number(form.price) === tier.price && form.paddlePriceId === tier.paddlePriceId;
                    return (
                      <button
                        key={tier.paddlePriceId}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, price: String(tier.price), paddlePriceId: tier.paddlePriceId }))}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid ' + (isSelected ? '#2563eb' : '#cbd5e1'),
                          background: isSelected ? '#2563eb' : '#fff',
                          color: isSelected ? '#fff' : '#1e293b',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Linked Paddle Price ID: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{form.paddlePriceId || 'None'}</code>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags && (tags as Tag[]).length > 0 && (
            <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(tags as Tag[]).map((tag) => {
                  const selected = form.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '100px',
                        border: '1px solid ' + (selected ? '#93c5fd' : '#e2e8f0'),
                        background: selected ? '#dbeafe' : '#fff',
                        color: selected ? '#1d4ed8' : '#64748b',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* File uploads */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Files</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>CAD File (DWG/DXF etc.)</label>
                <input
                  ref={cadFileRef}
                  type="file"
                  accept=".dwg,.dxf,.skp,.rvt,.ifc,.step,.stp,.3ds,.max"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '9px',
                    fontSize: '13px',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Max 200MB</p>
              </div>

              <div>
                <label style={labelStyle}>Preview Image (will be watermarked)</label>
                <input
                  ref={previewRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '9px',
                    fontSize: '13px',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Watermark will be burned in server-side
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '14px',
              }}
            >
              {createMutation.isPending ? 'Creating…' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="btn btn-secondary"
              style={{
                padding: '10px 20px',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
