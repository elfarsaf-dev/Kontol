import React, { createContext, useContext, useState, useEffect } from "react";

interface Track {
  title: string;
  artist: string;
  image: string;
  link?: string;
  audioUrl?: string;
  timestamp?: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  playTrack: (track: Track, queue?: Track[]) => void;
  playNext: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  recentTracks: Track[];
  addToRecent: (track: Track) => void;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  isLiked: (link?: string) => boolean;
  premiumKey: string | null;
  setPremiumKey: (key: string | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const CACHE_DURATION = 24 * 60 * 60 * 1000; // Extend to 24 hours

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [premiumKey, setPremiumKey] = useState<string | null>(() => localStorage.getItem("premium_key"));
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    const saved = localStorage.getItem("last_track");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentTracks, setRecentTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem("recent_tracks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        return parsed.filter((t: Track) => t.timestamp && (now - t.timestamp < CACHE_DURATION));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem("liked_tracks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("liked_tracks", JSON.stringify(likedTracks));
  }, [likedTracks]);

  const toggleLike = (track: Track) => {
    setLikedTracks(prev => {
      const isAlreadyLiked = prev.some(t => t.link === track.link);
      if (isAlreadyLiked) {
        return prev.filter(t => t.link !== track.link);
      }
      return [track, ...prev];
    });
  };

  const isLiked = (link?: string) => {
    if (!link) return false;
    return likedTracks.some(t => t.link === link);
  };

  useEffect(() => {
    localStorage.setItem("recent_tracks", JSON.stringify(recentTracks));
  }, [recentTracks]);

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem("last_track", JSON.stringify(currentTrack));
    }
  }, [currentTrack]);

  useEffect(() => {
    if (premiumKey) {
      localStorage.setItem("premium_key", premiumKey);
    } else {
      localStorage.removeItem("premium_key");
    }
  }, [premiumKey]);

  const addToRecent = (track: Track) => {
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t.link !== track.link);
      const newTrack = { ...track, timestamp: Date.now() };
      const updated = [newTrack, ...filtered].slice(0, 50); // Keep more history
      return updated;
    });
  };

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (newQueue) {
      setQueue(newQueue);
    }
    const cached = recentTracks.find(t => t.link === track.link);
    const now = Date.now();
    
    if (cached && cached.audioUrl && cached.timestamp && (now - cached.timestamp < CACHE_DURATION)) {
      setCurrentTrack(cached);
    } else {
      setCurrentTrack(track);
    }
    setIsPlaying(true);
  };

  const playNext = () => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(t => t.link === currentTrack?.link);
      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        playTrack(queue[currentIndex + 1]);
        return;
      }
    }

    if (recentTracks.length > 1) {
      const currentIndex = recentTracks.findIndex(t => t.link === currentTrack?.link);
      const nextIndex = (currentIndex + 1) % recentTracks.length;
      playTrack(recentTracks[nextIndex]);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      playTrack, 
      playNext, 
      isPlaying, 
      setIsPlaying, 
      recentTracks, 
      addToRecent,
      likedTracks,
      toggleLike,
      isLiked,
      premiumKey,
      setPremiumKey
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
