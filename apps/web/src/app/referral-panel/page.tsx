// apps/web/src/app/referral/page.tsx — referral agent dashboard (read-only).
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '../../lib/env';

const TOKEN_KEY = 'referral_agent_token';

interface DashboardUser {
  id: string;
  phone: string;
  displayName: string | null;
  joinedAt: string;
  roundsPlayed: number;
  totalDeposited: number;
  totalWagered: number;
  totalPayout: number;
  netSpend: number;
  balance: number;
}
interface Dashboard {
  inviteUrl: string;
  referralCode: string;
  totals: Omit<DashboardUser, 'id' | 'phone' | 'displayName' | 'joinedAt' | 'netSpend' | 'balance'> & {
    users: number;
    netSpend: number;
  };
  commissionEarned: number;
  users: DashboardUser[];
}

export default function ReferralDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.replace('/referral-panel/login');
      return;
    }
    fetch(`${apiBaseUrl()}/referral-panel/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          router.replace('/referral-panel/login');
          return;
        }
        const json = (await res.json().catch(() => null)) as { data?: Dashboard } | null;
        if (!res.ok || !json?.data) setError('Failed to load dashboard');
        else setData(json.data);
      })
      .catch(() => setError('Network error'));
  }, [router]);

  if (error) return <Center>{error}</Center>;
  if (!data) return <Center>Loading…</Center>;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Referral Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem(TOKEN_KEY);
            router.replace('/referral-panel/login');
          }}
          style={btnStyle}
        >
          Log out
        </button>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 13, color: '#9aa3c0' }}>Your unique invite link</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input readOnly value={data.inviteUrl} style={{ ...inputStyle, flex: 1 }} />
          <button
            style={btnStyle}
            onClick={() => navigator.clipboard?.writeText(data.inviteUrl)}
          >
            Copy
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#9aa3c0', marginTop: 8 }}>
          Code: <b>{data.referralCode}</b> · Commission earned: <b>₨{data.commissionEarned.toFixed(2)}</b>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '16px 0' }}>
        <Stat label="Invited users" value={data.totals.users} />
        <Stat label="Total deposited" value={`₨${data.totals.totalDeposited.toFixed(2)}`} />
        <Stat label="Total wagered" value={`₨${data.totals.totalWagered.toFixed(2)}`} />
        <Stat label="Rounds played" value={data.totals.roundsPlayed} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#9aa3c0', borderBottom: '1px solid #232a45' }}>
            <th style={th}>Player</th>
            <th style={th}>Joined</th>
            <th style={th}>Deposited</th>
            <th style={th}>Wagered</th>
            <th style={th}>Payout</th>
            <th style={th}>Net spend</th>
            <th style={th}>Rounds</th>
            <th style={th}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #1a2036' }}>
              <td style={td}>{u.displayName || u.phone}</td>
              <td style={td}>{new Date(u.joinedAt).toLocaleDateString()}</td>
              <td style={td}>₨{u.totalDeposited.toFixed(2)}</td>
              <td style={td}>₨{u.totalWagered.toFixed(2)}</td>
              <td style={td}>₨{u.totalPayout.toFixed(2)}</td>
              <td style={td}>₨{u.netSpend.toFixed(2)}</td>
              <td style={td}>{u.roundsPlayed}</td>
              <td style={td}>₨{u.balance.toFixed(2)}</td>
            </tr>
          ))}
          {data.users.length === 0 && (
            <tr>
              <td style={td} colSpan={8}>
                No invited users yet — share your link.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: '#9aa3c0' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}
function Center({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
}
const cardStyle: React.CSSProperties = {
  background: '#121627',
  border: '1px solid #232a45',
  borderRadius: 12,
  padding: 16,
};
const inputStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #2a3352',
  background: '#0b0e17',
  color: '#e7eaf3',
};
const btnStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #2a3352',
  background: '#1a2036',
  color: '#e7eaf3',
  cursor: 'pointer',
};
const th: React.CSSProperties = { padding: '8px 10px' };
const td: React.CSSProperties = { padding: '8px 10px' };
