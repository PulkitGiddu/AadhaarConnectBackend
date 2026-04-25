import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

/**
 * Dashboard layout — sidebar + content area matching the AadhaarConnect design system.
 */
export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get user info from localStorage (set after OTP verification)
  const userName = localStorage.getItem('ac_userName') || 'User';
  const maskedAadhaar = localStorage.getItem('ac_maskedAadhaar') || 'XXXX XXXX XXXX';

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', end: true },
    { path: '/dashboard/security', icon: 'security', label: 'Security & Sign-In' },
    { path: '/dashboard/audit', icon: 'audit', label: 'Audit Log' },
    { path: '/dashboard/developer', icon: 'developer', label: 'Developer Portal' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'dashboard':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        );
      case 'security':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case 'audit':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'developer':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ac_userName');
    localStorage.removeItem('ac_maskedAadhaar');
    localStorage.removeItem('ac_userHash');
    localStorage.removeItem('ac_claims');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-aadhaar-card border-r border-aadhaar-border/50 flex flex-col fixed h-full z-20">
        {/* Brand */}
        <div className="p-5 border-b border-aadhaar-border/30">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Aadhaar</span>
            <span className="text-lg font-light text-aadhaar-orange">Connect</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-green-400 uppercase tracking-widest mt-1 font-semibold">Verified Identity</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-aadhaar-surface/50'
                }`
              }
            >
              {getIcon(item.icon)}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Secure Logout */}
        <div className="p-3 border-t border-aadhaar-border/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-56">
        {/* Top bar */}
        <header className="h-14 border-b border-aadhaar-border/30 bg-aadhaar-bg/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
          <div></div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-aadhaar-surface/50 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            {/* Settings */}
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-aadhaar-surface/50 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {/* User */}
            <div className="flex items-center gap-3 pl-4 border-l border-aadhaar-border/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aadhaar-orange to-aadhaar-red flex items-center justify-center">
                <span className="text-xs font-bold text-white">{userName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none">{userName}</p>
                <p className="text-[10px] text-gray-500 font-mono">{maskedAadhaar}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
