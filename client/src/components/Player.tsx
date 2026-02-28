import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, ListMusic, ChevronRight, ChevronLeft, Music, Loader2, Download, Crown, ExternalLink, X } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, addToRecent, playNext, premiumKey, setPremiumKey } = usePlayer();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPremiumInput, setShowPremiumInput] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.audioUrl) {
        setAudioUrl(currentTrack.audioUrl);
        setIsLoading(false);
        return;
      }

      setAudioUrl(null);
      setIsLoading(true);
      const spotifyLink = currentTrack.link;
      if (!spotifyLink) {
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }
      
      const apiUrl = premiumKey 
        ? `https://api.ferdev.my.id/downloader/spotify?link=${encodeURIComponent(spotifyLink)}&apikey=${premiumKey}`
        : `https://spotify.elfar.my.id/api/spotify?link=${encodeURIComponent(spotifyLink)}`;

      // Gunakan AbortController untuk membatalkan fetch jika track berubah
      const controller = new AbortController();
      
      fetch(apiUrl, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          if (data.success === false && data.status === 403) {
            import("sonner").then(({ toast }) => {
              toast.error("API Key Tidak Valid!", {
                description: "Silahkan daftar premium di api.ferdev.my.id",
                action: {
                  label: "Daftar",
                  onClick: () => window.open("https://api.ferdev.my.id/register", "_blank")
                }
              });
            });
            setPremiumKey(null); // Reset key yang salah
            setIsPlaying(false);
            setIsLoading(false);
            return;
          }

          const url = data.download;
          if (url) {
            // Optimasi: Gunakan URL proxy atau pastikan server mendukung range requests
            // Untuk prototype ini, kita set audioUrl dan paksa reload
            setAudioUrl(url);
            addToRecent({ ...currentTrack, audioUrl: url });
            
            // Berikan sedikit delay untuk buffering awal yang lebih baik
            if (audioRef.current) {
              audioRef.current.load();
            }
          } else {
            setIsPlaying(false);
          }
          setIsLoading(false);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setIsPlaying(false);
            setIsLoading(false);
          }
        });

      return () => controller.abort();
    }
  }, [currentTrack?.link, premiumKey]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  if (!currentTrack) return null;

  return (
    <>
      <audio 
        ref={audioRef} 
        src={audioUrl || ""} 
        preload="auto"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) {
            setProgress((el.currentTime / el.duration) * 100);
          }
        }}
        onCanPlay={() => isPlaying && audioRef.current?.play()}
        onEnded={() => {
          // Hanya pindah lagu jika progres memang sudah di ujung (mencegah bug onEnded prematur)
          if (progress > 95) {
            playNext();
          }
        }}
      />

      {/* Floating Toggle Button when collapsed */}
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="fixed right-4 bottom-24 w-12 h-12 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group"
        >
          <Music className="w-5 h-5 group-hover:animate-bounce" />
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white text-black p-1 rounded-full shadow-md">
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>
      )}

      {/* Right Side Panel Player */}
      <div className={cn(
        "fixed top-1/2 -translate-y-1/2 right-4 w-72 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-500 z-50 flex flex-col shadow-2xl overflow-hidden",
        isExpanded ? "h-[60vh] opacity-100 scale-100" : "h-0 opacity-0 scale-95 pointer-events-none"
      )}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex flex-col">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-green-500" />
              Now Playing
            </h3>
            <button 
              onClick={() => setShowPremiumInput(!showPremiumInput)}
              className={cn(
                "text-[10px] flex items-center gap-1 transition-colors mt-1 px-2 py-0.5 rounded-full w-fit",
                premiumKey ? "bg-yellow-500/20 text-yellow-500" : "bg-white/5 text-white/40 hover:text-white"
              )}
            >
              <Crown className="w-3 h-3" />
              {premiumKey ? "Premium Active" : "Go Premium"}
            </button>
          </div>
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Premium Input Overlay */}
        {showPremiumInput && (
          <div className="absolute top-[72px] left-0 right-0 p-4 bg-[#181818] border-b border-white/10 z-20 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">Premium API Key</span>
                <button onClick={() => setShowPremiumInput(false)}><X className="w-4 h-4 text-white/40" /></button>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter API Key..." 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="h-8 bg-white/5 border-white/10 text-xs"
                />
                <Button 
                  size="sm" 
                  className="h-8 text-xs bg-green-500 hover:bg-green-600 text-black"
                  onClick={() => {
                    setPremiumKey(tempKey);
                    setShowPremiumInput(false);
                  }}
                >
                  Save
                </Button>
              </div>
              <a 
                href="https://wa.me/yournumber" 
                target="_blank" 
                className="text-[10px] text-green-500 flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Get API Key via WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4 scrollbar-hide">
          {/* Cover Art */}
          <div className="w-40 aspect-square rounded-xl overflow-hidden shadow-2xl group relative">
            <img 
              src={currentTrack.image} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Info */}
          <div className="w-full text-center space-y-1">
            <h2 className="text-lg font-black text-white leading-tight line-clamp-1">{currentTrack.title}</h2>
            <p className="text-sm text-white/60 font-medium hover:text-white transition-colors cursor-pointer">{currentTrack.artist}</p>
          </div>

          {/* Controls */}
          <div className="w-full space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <Slider 
                value={[progress]} 
                max={100} 
                step={0.1}
                onValueChange={(vals) => {
                  if (audioRef.current && audioRef.current.duration) {
                    const time = (vals[0] / 100) * audioRef.current.duration;
                    audioRef.current.currentTime = time;
                    setProgress(vals[0]);
                  }
                }}
                className="w-full cursor-pointer h-1"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40 tracking-wider">
                <span>{audioRef.current ? Math.floor(audioRef.current.currentTime / 60) + ":" + ("0" + Math.floor(audioRef.current.currentTime % 60)).slice(-2) : "0:00"}</span>
                <span>{audioRef.current && audioRef.current.duration ? Math.floor(audioRef.current.duration / 60) + ":" + ("0" + Math.floor(audioRef.current.duration % 60)).slice(-2) : "3:45"}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-6">
                <button className="text-white/40 hover:text-green-500 transition-colors"><Shuffle className="w-4 h-4" /></button>
                <button 
                  onClick={() => {
                    // Previous track logic
                    console.log("Previous track");
                  }}
                  className="text-white/80 hover:text-white transition-colors transform active:scale-90"
                ><SkipBack className="w-6 h-6 fill-current" /></button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isLoading}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-black shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>
                <button 
                  onClick={() => playNext()}
                  className="text-white/80 hover:text-white transition-colors transform active:scale-90"
                ><SkipForward className="w-6 h-6 fill-current" /></button>
                <button className="text-white/40 hover:text-green-500 transition-colors"><Repeat className="w-4 h-4" /></button>
              </div>

              {/* Volume & Download */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                  <Volume2 className="w-4 h-4 text-white/40" />
                  <Slider defaultValue={[70]} max={100} step={1} className="flex-1 h-1" />
                  <ListMusic className="w-4 h-4 text-white/40 hover:text-white cursor-pointer" />
                </div>
                
                {audioUrl && (
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2 rounded-lg py-4 h-8 text-xs"
                    onClick={() => window.open(audioUrl, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                    Download Track
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
