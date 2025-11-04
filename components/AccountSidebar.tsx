// components/AccountSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { messagesStorage } from "@/lib/messages.storage";

const navigation = [
  { name: 'Moje nabídky', href: '/account/offers', icon: '📋' },
  { name: 'Moji klienti', href: '/account/clients', icon: '👥' },
  { name: 'Zprávy', href: '/account/messages', icon: '💬' },
  { name: 'Profil', href: '/account/profile', icon: '👤' },
  { name: 'Nastavení', href: '/account/settings', icon: '⚙️' },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Load unread messages count
  useEffect(() => {
    const loadUnreadCount = () => {
      try {
        const count = messagesStorage.getTotalUnreadCount();
        setUnreadMessagesCount(count);
      } catch (error) {
        console.warn('Failed to load unread messages count:', error);
      }
    };

    // Load initially
    loadUnreadCount();

    // Reload every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-[#D2DED8] min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isMessagesPage = item.href === '/account/messages';
            const showBadge = isMessagesPage && unreadMessagesCount > 0;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E7EFEA] text-[#2F4B40] border border-[#C8D6CF]'
                      : 'text-gray-700 hover:bg-[#F5F7F6] hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {showBadge && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium px-2">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}