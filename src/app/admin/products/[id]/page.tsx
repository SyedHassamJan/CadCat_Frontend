'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import api from '@/lib/api';
import { PRICE_TIERS } from '@/lib/paddle-tiers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; }

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const cadFileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [cadFileName, setCadFileName] = useState('');

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

  // Fetch existing product
  const { data: product, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => api.get(`/products/admin/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  // Populate form once product loads
  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      isFree: product.isFree ?? true,
      price: product.price ? String(product.price) : '',
      currency: product.currency || 'USD',
      fileFormat: product.fileFormat || 'dwg',
      cadVersion: product.cadVersion || '',
      status: product.status || 'DRAFT',
      paddlePriceId: product.paddlePriceId || '',
      tagIds: (product.productTags || []).map((pt: any) => pt.tagId),
    });
  }, [product]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: tags } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/products/${id}`, data).then((r) => r.data),
    onSuccess: async () => {
      // Upload new files if selected
      const cadFile = cadFileRef.current?.files?.[0];
      const previewImg = previewRef.current?.files?.[0];

      if (cadFile || previewImg) {
        const fd = new FormData();
        if (cadFile) fd.append('cadFile', cadFile);
        if (previewImg) fd.append('previewImage', previewImg);

        try {
          await api.post(`/products/${id}/media`, fd);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to upload files');
          return;
        }
      }

      setSuccess('Product updated successfully!');
      setTimeout(() => router.push('/admin/products'), 1200);
    },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update product'),
  });

  function toggleTag(tagId: string) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId) ? f.tagIds.filter((t) => t !== tagId) : [...f.tagIds, tagId],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    updateMutation.mutate({
      ...form,
      price: form.isFree ? null : parseFloat(form.price) || null,
    });
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '9px',
    fontSize: '14px', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box',
  } as React.CSSProperties;

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: '#475569', marginBottom: '6px',
  } as React.CSSProperties;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: '#94a3b8' }}>
        <div>Loading product…</div>
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        Product not found. <a href="/admin/products" style={{ color: '#2563eb' }}>Go back</a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="accent-label" style={{ marginBottom: '8px' }}>Catalogue Management</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-900)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Edit Product
        </h1>
        <p style={{ color: 'var(--surface-600)', fontSize: '14px' }}>
          {product?.title}
        </p>
      </div>

      {success && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '14px', color: '#065f46', fontWeight: 600, marginBottom: '20px', fontSize: '14px' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '14px', color: '#991b1b', fontWeight: 600, marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', margin: 0 }}>
            Product Details
          </h2>

          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} type="text" required value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Modern Chair Collection DWG" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the CAD block pack..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                <option value="">— No category —</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>CAD Format</label>
              <select style={inputStyle} value={form.fileFormat}
                onChange={(e) => setForm((f) => ({ ...f, fileFormat: e.target.value }))}>
                {['dwg', 'dxf', 'skp', 'rvt', 'ifc', 'step', '3ds', 'max'].map((fmt) => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>CAD Version</label>
              <input style={inputStyle} type="text" value={form.cadVersion}
                onChange={(e) => setForm((f) => ({ ...f, cadVersion: e.target.value }))}
                placeholder="e.g. AutoCAD 2020" />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
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
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', border: '1px solid ' + (form.isFree ? '#6ee7b7' : '#e2e8f0'), borderRadius: '9px', background: form.isFree ? '#d1fae5' : '#fff' }}>
                <input type="radio" checked={form.isFree} onChange={() => setForm((f) => ({ ...f, isFree: true, price: '', paddlePriceId: '' }))} />
                <span style={{ fontWeight: 600, fontSize: '14px', color: form.isFree ? '#065f46' : '#64748b' }}>Free</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', border: '1px solid ' + (!form.isFree ? '#a78bfa' : '#e2e8f0'), borderRadius: '9px', background: !form.isFree ? '#ede9fe' : '#fff' }}>
                <input type="radio" checked={!form.isFree} onChange={() => {
                  const defaultTier = PRICE_TIERS[1]; // $3.00 default
                  setForm((f) => ({ ...f, isFree: false, price: String(defaultTier.price), paddlePriceId: defaultTier.paddlePriceId }));
                }} />
                <span style={{ fontWeight: 600, fontSize: '14px', color: !form.isFree ? '#5b21b6' : '#64748b' }}>Paid</span>
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

          {/* Media Files (Upload / Replace) */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Media & Files</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Preview Image */}
              <div>
                <label style={labelStyle}>Preview Image (PNG, JPG, WebP)</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                  {product.thumbnailKey && !previewFileName && (
                    <div style={{ marginBottom: '10px' }}>
                      <img
                        src={`${API_BASE}/products/media/${product.thumbnailKey}`}
                        alt="Current preview"
                        style={{ maxHeight: '80px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Current image</div>
                    </div>
                  )}
                  <input
                    ref={previewRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    id="editPreviewUpload"
                    onChange={(e) => setPreviewFileName(e.target.files?.[0]?.name || '')}
                  />
                  <label htmlFor="editPreviewUpload" style={{ cursor: 'pointer', display: 'inline-block', padding: '6px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {previewFileName ? `Selected: ${previewFileName}` : product.thumbnailKey ? 'Replace Image' : 'Upload Image'}
                  </label>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0' }}>
                    Recommended: 800×600px (4:3 ratio), Max 20MB. Transparent PNGs are auto-processed.
                  </p>
                </div>
              </div>

              {/* CAD File */}
              <div>
                <label style={labelStyle}>CAD Drawing File (.dwg, .dxf, .skp)</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                  {product.fileKey && !cadFileName && (
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Check size={14} /> CAD file attached ({product.fileFormat?.toUpperCase() || 'DWG'})
                    </div>
                  )}
                  <input
                    ref={cadFileRef}
                    type="file"
                    accept=".dwg,.dxf,.skp,.rvt,.ifc,.step,.stp,.3ds,.max"
                    style={{ display: 'none' }}
                    id="editCadUpload"
                    onChange={(e) => setCadFileName(e.target.files?.[0]?.name || '')}
                  />
                  <label htmlFor="editCadUpload" style={{ cursor: 'pointer', display: 'inline-block', padding: '6px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {cadFileName ? `Selected: ${cadFileName}` : product.fileKey ? 'Replace CAD File' : 'Upload CAD File'}
                  </label>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0' }}>
                    Max 200MB. Stored securely in private cloud storage.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);
                  return (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                      style={{ padding: '5px 14px', borderRadius: '100px', border: '1px solid ' + (selected ? 'var(--brand-400)' : '#e2e8f0'), background: selected ? 'var(--brand-50)' : '#fff', color: selected ? 'var(--brand-900)' : '#64748b', fontWeight: selected ? 700 : 600, fontSize: '13px', cursor: 'pointer' }}>
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button type="submit" disabled={updateMutation.isPending}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px' }}>
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/admin/products')}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
