'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.access_token, data.admin);
      router.replace('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="admin-login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="admin-login-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ marginBottom: '14px' }}>
            <span
              className="logo-mark"
              style={{
                fontSize: '18px',
                padding: '6px 14px',
                boxShadow: '0 0 24px rgba(198, 241, 53, 0.35)',
              }}
            >
              ⬡ CAD Marketplace
            </span>
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              fontStyle: 'italic',
              color: 'var(--brand-900)',
              fontFamily: "'Outfit', sans-serif",
              marginBottom: '4px',
            }}
          >
            Admin Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Sign in to manage your marketplace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@cadmarketplace.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--surface-50)',
                border: '1px solid var(--surface-200)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--brand-500)';
                e.target.style.boxShadow = '0 0 0 3px rgba(198, 241, 53, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--surface-200)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--surface-50)',
                border: '1px solid var(--surface-200)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--brand-500)';
                e.target.style.boxShadow = '0 0 0 3px rgba(198, 241, 53, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--surface-200)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: loading ? 'var(--brand-600)' : 'linear-gradient(135deg, var(--brand-500), var(--brand-600))',
              color: 'var(--brand-900)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'all 0.15s',
              boxShadow: '0 4px 12px rgba(198, 241, 53, 0.35)',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
