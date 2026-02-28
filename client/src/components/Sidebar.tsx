import { Link, useLocation } from "wouter";
import { 
  Home, 
  Search, 
  Library, 
  PlusSquare, 
  Heart, 
  AudioWaveform,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Library, label: "Library", href: "/library" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-white/5 sidebar-glass h-screen">
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(138,44,226,0.5)]">
              <AudioWaveform className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
  <span className="text-white">Elfar</span>
  <span className="text-purple-500 italic">Tunes</span>
</h1>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all",
                  location === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-1">
            <p className="px-3 text-xs font-bold text-white/40 uppercase tracking-widest mb-2">History</p>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all w-full text-left cursor-pointer">
              <AudioWaveform className="w-5 h-5 text-primary" />
              <span>Recent Plays</span>
            </button>
          </div>

          <div className="mt-auto">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm font-semibold mb-1 text-white">SonicFlow Free</p>
              <p className="text-xs text-white/60">Enjoy your music.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-white/10 z-50 flex items-center justify-around px-4">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <a className={cn(
              "flex flex-col items-center gap-1 transition-all",
              location === item.href ? "text-primary" : "text-white/60"
            )}>
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          </Link>
        ))}
        <button className="flex flex-col items-center gap-1 text-white/60">
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-medium">Liked</span>
        </button>
      </nav>
    </>
  );
}
