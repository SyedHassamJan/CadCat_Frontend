'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, FormEvent } from 'react';
import api from '@/lib/api';

export default function AdminTagsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tags', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      setName('');
      setError('');
    },
    onError: (e: any) => setError(e.response?.data?.message || 'Error creating tag'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tags/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
    onError: (e: any) => alert(e.response?.data?.message || 'Error deleting tag'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name });
  }

  const tagList = Array.isArray(tags) ? tags : [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="accent-label" style={{ marginBottom: '8px' }}>Metadata</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-900)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>Tags</h1>
      </div>

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
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-900)', marginBottom: '16px' }}>Add Tag</h2>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name (e.g. Modern, Minimalist)"
            style={{
              flex: 1,
              padding: '9px 12px',
              border: '1px solid var(--surface-200)',
              borderRadius: '9px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn btn-primary"
            style={{
              padding: '9px 20px',
              fontSize: '14px',
            }}
          >
            {createMutation.isPending ? 'Adding…' : 'Add Tag'}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '100px' }} />
          ))
        ) : tagList.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>No tags yet.</p>
        ) : (
          tagList.map((tag: any) => (
            <div
              key={tag.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              {tag.name}
              {tag._count?.productTags !== undefined && (
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>({tag._count.productTags})</span>
              )}
              <button
                onClick={() => {
                  if (confirm(`Delete tag "${tag.name}"?`)) deleteMutation.mutate(tag.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  padding: '0 2px',
                  fontSize: '14px',
                  lineHeight: 1,
                }}
                title="Delete tag"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
