// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Image, Upload, Search,
  Download, Package, Activity, User, Settings,
  Shield, ChevronLeft, ChevronRight, FolderOpen
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/photos', icon: Image, label: 'Photos' },
  { href: '/upload', icon: Upload, label: 'Upload Center' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/downloads', icon: Download, label: 'Downloads' },
  { href: '/export', icon: Package, label: 'Export Center' },
  { href: '/activity', icon: Activity, label: 'Activity Logs' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full overflow-hidden flex-shrink-0 relative"
      style={{
        background: 'hsl(var(--sidebar-bg))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-white text-sm whitespace-nowrap"
              >
                SidLocker
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={`sidebar-item ${active ? 'active' : ''}`}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap text-sm"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 flex-shrink-0" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg transition-colors"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
