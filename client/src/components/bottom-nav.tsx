import { Link, useLocation } from "wouter";
import { Home, Search, Users, Bookmark, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                    isActive ? "text-garden-green" : "text-gray-600 hover:text-garden-green"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
