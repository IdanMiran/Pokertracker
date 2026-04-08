import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Sessions } from './pages/Sessions';
import { Players } from './pages/Players';
import { NewSession } from './pages/NewSession';
import { SessionDetail } from './pages/SessionDetail';

function BottomNav() {
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith('/session/');

  if (isDetailPage) return null;

  const tabs = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/sessions', label: 'Sessions', icon: '🃏' },
    { to: '/players', label: 'Players', icon: '👥' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[#333] z-40"
      style={{ backgroundColor: '#1a1a1a', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-semibold transition-colors ${isActive ? 'text-[#dc2626]' : 'text-[#888]'}`
          }>
          <span className="text-xl leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function TopBar() {
  const location = useLocation();

  const titles: Record<string, string> = {
    '/': 'Poker Tracker',
    '/sessions': 'Sessions',
    '/players': 'Players',
    '/session/new': 'New Session',
  };

  const isSession = location.pathname.match(/^\/session\/(?!new)[^/]+$/);
  const title = isSession ? '' : (titles[location.pathname] ?? 'Poker Tracker');

  return (
    <header className="sticky top-0 z-30 flex items-center px-4 h-14 border-b border-[#333]"
      style={{ backgroundColor: '#0a0a0a' }}>
      {isSession && (
        <NavLink to="/sessions" className="mr-3 text-lg" style={{ color: '#dc2626' }}>←</NavLink>
      )}
      <h1 className="text-lg font-bold" style={{ color: '#f5f5f5' }}>{title}</h1>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col max-w-lg mx-auto" style={{ minHeight: '100dvh', backgroundColor: '#0a0a0a' }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/players" element={<Players />} />
            <Route path="/session/new" element={<NewSession />} />
            <Route path="/session/:id" element={<SessionDetail />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
