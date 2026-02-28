import Sidebar from "@/components/Sidebar";
import AlbumCard from "@/components/AlbumCard";
import { usePlayer } from "@/hooks/use-player";

export default function Library() {
  const { recentTracks, likedTracks } = usePlayer();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Liked Songs</h2>
          {likedTracks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {likedTracks.map((track, i) => (
                <AlbumCard key={`liked-${track.link}-${i}`} {...track} queue={likedTracks} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[20vh] text-white/40 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-lg font-medium">No liked songs yet.</p>
              <p className="text-sm">Tap the heart icon to save songs here!</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8">Recent Plays</h2>
          {recentTracks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recentTracks.map((track, i) => (
                <AlbumCard key={`recent-${track.link}-${i}`} {...track} queue={recentTracks} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[20vh] text-white/40 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-lg font-medium">No recent tracks yet.</p>
              <p className="text-sm">Start listening to some music!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
