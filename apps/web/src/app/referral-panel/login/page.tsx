// apps/web/src/app/referral/login/page.tsx — referral agent login.
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '../../../lib/env';

const TOKEN_KEY = 'referral_agent_token';

export default function ReferralLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${apiBaseUrl()}/referral-panel/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const json = (await res.json().catch(() => null)) as {
        data?: { token?: string };
        error?: { message?: string };
      } | null;
      if (!res.ok || !json?.data?.token) {
        setError(json?.error?.message || 'Invalid phone or password');
        return;
      }
      localStorage.setItem(TOKEN_KEY, json.data.token);
      router.push('/referral-panel');
    } catch {
      setError('Network error — try again');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: 340,
          padding: 28,
          background: '#121627',
          borderRadius: 12,
          border: '1px solid #232a45',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20 }}>Referral Partner Login</h1>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          required
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={inputStyle}
        />
        {error && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>}
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: 10,
            borderRadius: 8,
            border: 0,
            background: '#4f7cff',
            color: '#fff',
            fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #2a3352',
  background: '#0b0e17',
  color: '#e7eaf3',
};
