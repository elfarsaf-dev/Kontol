import { Play, Pause, Loader2 } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { useState, useEffect } from "react";

interface AlbumCardProps {
  title: string;
  artist: string;
  image: string;
  link?: string;
  audioUrl?: string;
  className?: string;
  queue?: any[];
}

export default function AlbumCard({ title, artist, image, link, audioUrl, className, queue }: AlbumCardProps) {
  const { playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
  
  const isCurrent = currentTrack?.title === title && currentTrack?.artist === artist;

  // Reset loading state when track changes or finishes loading globally
  useEffect(() => {
    if (isCurrent && currentTrack?.audioUrl) {
      setIsLoading(false);
    }
  }, [isCurrent, currentTrack?.audioUrl]);

  const handleCardClick = () => {
    if (link) {
      playTrack({ 
        title, 
        artist, 
        image, 
        link,
        audioUrl
      }, queue);
    }
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      if (link) {
        setIsLoading(!audioUrl); // Only show loader if we don't have audioUrl yet
        playTrack({ 
          title, 
          artist, 
          image, 
          link,
          audioUrl
        }, queue);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer relative shadow-sm ${className}`}
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
        <button 
          onClick={handlePlayToggle}
          disabled={isLoading && isCurrent}
          className={`absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center transition-all text-white ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          {isLoading && isCurrent ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isCurrent && isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>
      </div>
      <h4 className={`font-bold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>{title}</h4>
      <p className="text-sm text-white/60 truncate mt-1">{artist}</p>
    </div>
  );
}
