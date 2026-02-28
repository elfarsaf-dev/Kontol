import Sidebar from "@/components/Sidebar";
import AlbumCard from "@/components/AlbumCard";
import { usePlayer } from "@/hooks/use-player";

export default function Library() {
  const { recentTracks } = usePlayer();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
        <h2 className="text-3xl font-bold mb-8">Recent Plays</h2>
        
        {recentTracks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recentTracks.map((track, i) => (
              <AlbumCard key={`${track.link}-${i}`} {...track} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-white/40">
            <p className="text-lg font-medium">No recent tracks yet.</p>
            <p className="text-sm">Start listening to some music!</p>
          </div>
        )}
      </main>
    </div>
  );
}
