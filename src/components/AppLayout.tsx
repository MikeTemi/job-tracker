'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Applications', href: '/applications' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Timeline', href: '/timeline' },
    { name: 'AI Insights', href: '/ai-insights' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Job Tracker
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage your career</p>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  block px-4 py-3 rounded-lg transition-all duration-200 font-medium
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={(e) => {
                  setSidebarOpen(false); // Close sidebar on mobile after click
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Add icons for better visual hierarchy */}
                    <span className="text-lg">
                      {item.name === 'Dashboard' && '🏠'}
                      {item.name === 'Applications' && '📋'}
                      {item.name === 'Analytics' && '📊'}
                      {item.name === 'AI Insights' && '🧠'}
                      {item.name === 'Timeline' && '📅'}
                      {item.name === 'Settings' && '⚙️'}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.name === 'Analytics' && !isActive && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                      New!
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white/50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Job Tracker v1.0</p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-3 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          ☰
        </button>
      </div>
      
      {/* Main content */}
      <div className="lg:ml-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}