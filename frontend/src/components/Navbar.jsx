import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, Image as ImageIcon, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Text Analyze', path: '/text', icon: FileText },
    { name: 'Image Analyze', path: '/image', icon: ImageIcon },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">ScamShield</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600",
                  isActive ? "text-blue-600" : "text-slate-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">Log In</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get Protected</Button>
        </div>
      </div>
    </nav>
  );
}
