import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, ListMusic, ChevronRight, ChevronLeft, Music, Loader2, Download, Crown, ExternalLink, X, Heart } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, addToRecent, playNext, premiumKey, setPremiumKey, toggleLike, isLiked } = usePlayer();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPremiumInput, setShowPremiumInput] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [premiumDownloadUrl, setPremiumDownloadUrl] = useState<string | null>(null);
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
      const videoUrl = currentTrack.link;
      if (!videoUrl) {
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }
      
      // Determine which API to use based on premiumKey
      const apiUrl = `https://ytmusc.elfar.my.id/api/yt-audio?url=${encodeURIComponent(videoUrl)}`;
      const downloadApiUrl = premiumKey ? `https://api.ferdev.my.id/downloader/ytmp3?link=${encodeURIComponent(videoUrl)}&apikey=${encodeURIComponent(premiumKey)}` : null;

      // Gunakan AbortController untuk membatalkan fetch jika track berubah
      const controller = new AbortController();
      
      const fetchAudio = async () => {
        try {
          // Selalu fetch dari ytmucs untuk playback agar cepat
          const res = await fetch(apiUrl, { signal: controller.signal });
          const data = await res.json();
          const url = data.stream || data.url;

          if (url) {
            setAudioUrl(url);
            addToRecent({ ...currentTrack, audioUrl: url });
            if (audioRef.current) audioRef.current.load();
            
            // Jika premium, kita juga fetch link downloadnya di background
            if (downloadApiUrl) {
              fetch(downloadApiUrl)
                .then(r => r.json())
                .then(d => {
                  if (d.data?.dlink) {
                    // Simpan link download premium ke state jika perlu atau gunakan langsung di tombol
                    // Untuk saat ini kita biarkan audioUrl tetap dari ytmucs untuk play
                    // Tapi kita bisa simpan d.data.dlink khusus untuk tombol download
                    setPremiumDownloadUrl(d.data.dlink);
                  }
                }).catch(() => {});
            }
          } else {
            setIsPlaying(false);
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            setIsPlaying(false);
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchAudio();
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
                href="https://wa.me/6283817779643?text=Halo%2C%20saya%20ingin%20mendapatkan%20API%20Key%20Premium%20untuk%20mendownload%"
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
          <div className="w-full text-center space-y-1 relative">
            <button 
              onClick={() => toggleLike(currentTrack)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
              <Heart 
                className={cn(
                  "w-5 h-5 transition-all",
                  isLiked(currentTrack.link) ? "fill-red-500 text-red-500 scale-110" : "text-white/40 group-hover:text-white"
                )} 
              />
            </button>
            <h2 className="text-lg font-black text-white leading-tight line-clamp-1 px-8">{currentTrack.title}</h2>
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2 rounded-lg py-4 h-8 text-xs"
                      onClick={() => window.open(audioUrl, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    {premiumKey && (
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-500 gap-2 rounded-lg py-4 h-8 text-xs font-bold"
                        onClick={() => {
                          const finalUrl = premiumDownloadUrl || audioUrl;
                          if (finalUrl) {
                            const link = document.createElement('a');
                            link.href = finalUrl;
                            link.download = `${currentTrack.title}.mp3`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                      >
                        <Crown className="w-3 h-3" />
                        Download(Pro)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
