import { Play, Heart, MoreHorizontal, BadgeCheck } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative w-full h-[300px] md:h-[350px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to top, #0a0a0a, transparent 70%), url('https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=2574&auto=format&fit=crop')` 
        }}
      />
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 gap-2">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">THE WEEKND</h2>
        <p className="text-xs md:text-sm text-white/80 font-medium">85.2M monthly listeners</p>
        
        <div className="flex items-center gap-3 mt-4">
          <button className="px-6 py-2 bg-primary rounded-full font-bold text-white hover:bg-primary/90 transition-all cursor-pointer text-sm">
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
