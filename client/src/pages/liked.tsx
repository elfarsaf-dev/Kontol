import Sidebar from "@/components/Sidebar";
import AlbumCard from "@/components/AlbumCard";
import { usePlayer } from "@/hooks/use-player";
import { Heart } from "lucide-react";

export default function Liked() {
  const { likedTracks } = usePlayer();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Liked Songs</h2>
            <p className="text-white/40 text-sm">{likedTracks.length} songs</p>
          </div>
        </div>
        
        {likedTracks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {likedTracks.map((track, i) => (
              <AlbumCard key={`liked-${track.link}-${i}`} {...track} queue={likedTracks} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-white/40 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Heart className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xl font-medium text-white/60">Your liked songs will appear here</p>
            <p className="text-sm">Save your favorite tracks to listen to them later</p>
          </div>
        )}
      </main>
    </div>
  );
}