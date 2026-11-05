// apps/web/src/app/referral/layout.tsx — referral agent console shell.
// Self-contained: no player/admin stores, no panel chrome.
import '../globals.css';

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0e17',
        color: '#e7eaf3',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
