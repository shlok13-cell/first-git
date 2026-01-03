import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Home } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/citizen", label: "Submit Grievance", icon: FileText },
    { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="border-b border-border/40 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-display">
              GR
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
              Nivaran AI
            </span>
          </div>

          <div className="flex space-x-1 sm:space-x-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
