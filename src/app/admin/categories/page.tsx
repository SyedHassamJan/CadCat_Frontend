'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, FormEvent } from 'react';
import api from '@/lib/api';

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/categories', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setParentId('');
      setError('');
    },
    onError: (e: any) => setError(e.response?.data?.message || 'Error creating category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    onError: (e: any) => alert(e.response?.data?.message || 'Error deleting category'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, parentId: parentId || undefined });
  }

  const cats = Array.isArray(categories) ? categories : [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="accent-label" style={{ marginBottom: '8px' }}>Taxonomy</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-900)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>Categories</h1>
      </div>

      {/* Add form */}
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--surface-200)',
          borderRadius: '14px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-900)', marginBottom: '16px' }}>
          Add Category
        </h2>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '9px 12px',
              border: '1px solid var(--surface-200)',
              borderRadius: '9px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            style={{
              padding: '9px 12px',
              border: '1px solid var(--surface-200)',
              borderRadius: '9px',
              fontSize: '14px',
              outline: 'none',
              minWidth: '160px',
            }}
          >
            <option value="">— Top level —</option>
            {cats.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn btn-primary"
            style={{
              padding: '9px 20px',
              fontSize: '14px',
            }}
          >
            {createMutation.isPending ? 'Adding…' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : cats.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No categories yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>{c.slug}</td>
                  <td style={{ color: '#64748b' }}>{c._count?.products ?? 0}</td>
                  <td>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${c.name}"?`)) deleteMutation.mutate(c.id);
                      }}
                      style={{
                        padding: '5px 12px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '7px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
