// src/components/layout/TopBar.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Sun, Moon, LogOut, Search, Bell, User, Shield } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function TopBar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
      style={{ borderBottom: '1px solid hsl(var(--sidebar-border))', background: 'hsl(var(--sidebar-bg))' }}>

      {/* Search shortcut */}
      <Link href="/search">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs hidden sm:block">Search documents...</span>
          <kbd className="hidden sm:block text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.08)', fontSize: '10px' }}>
            ⌘K
          </kbd>
        </div>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              <span className="text-white text-xs font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || 'S'}
              </span>
            </div>
            <span className="text-sm text-white hidden sm:block">{session?.user?.name || 'Siddharth'}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
              style={{ background: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-semibold text-white">{session?.user?.name}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{session?.user?.email}</p>
              </div>
              <div className="p-1">
                <Link href="/profile">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    onClick={() => setShowUserMenu(false)}>
                    <User className="w-3.5 h-3.5" /> Profile
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    onClick={() => setShowUserMenu(false)}>
                    <Shield className="w-3.5 h-3.5" /> Settings
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                  style={{ color: '#f87171' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
