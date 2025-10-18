'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calendar, History, Home } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/admin/employees', label: 'Çalışan Havuzu', icon: Users },
    { href: '/admin/attendance', label: 'Yoklama', icon: Calendar },
    { href: '/admin/history', label: 'Geçmiş', icon: History },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">
                Çalışan Takip
              </div>
            </Link>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

