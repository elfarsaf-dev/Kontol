import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import AlbumCard from "@/components/AlbumCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    // Fetch Trending from new API
    fetch("https://ytmusc.elfar.my.id/api/trending?region=ID", { mode: 'cors' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.results) {
          const mappedItems = data.results.map((item: any) => {
            const videoId = item.id;
            return {
              title: item.title,
              artist: item.channel || "Unknown Artist",
              image: item.thumbnail,
              link: `https://www.youtube.com/watch?v=${videoId}`,
              id: videoId
            };
          });
          setTrending(mappedItems);
        }
        setLoadingTrending(false);
      })
      .catch((err) => {
        console.error("Error fetching trending:", err);
        setLoadingTrending(false);
      });

    // Fetch Terbaru (using search for "terbaru" on new API)
    fetch("https://ytmusc.elfar.my.id/api/search?q=terbaru&type=video", { mode: 'cors' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.results) {
          const mappedItems = data.results.map((item: any) => {
            const videoId = item.id;
            return {
              title: item.title,
              artist: item.channel || "Unknown Artist",
              image: item.thumbnail,
              link: `https://www.youtube.com/watch?v=${videoId}`,
              id: videoId
            };
          });
          setLatest(mappedItems);
        }
        setLoadingLatest(false);
      })
      .catch((err) => {
        console.error("Error fetching latest:", err);
        setLoadingLatest(false);
      });
  }, []);

  const madeForYou: any[] = [];
    
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative pb-20">
        <Hero />
        
        <div className="px-4 md:px-10 py-6 md:py-8 flex flex-col gap-8 md:gap-10">
          <section>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">Trending 2026</h3>
              <a href="#" className="text-xs md:text-sm font-bold text-white/40 hover:text-primary transition-colors">Show all</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {loadingTrending ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-md bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                ))
              ) : (
                trending.filter(t => t.link).slice(0, 10).map((album, i) => (
                  <AlbumCard 
                    key={i} 
                    {...album} 
                    queue={trending.filter(t => t.link)}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">Daftar Terbaru</h3>
              <a href="#" className="text-xs md:text-sm font-bold text-white/40 hover:text-primary transition-colors">Show all</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {loadingLatest ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-md bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                ))
              ) : (
                latest.filter(t => t.link).slice(0, 10).map((album, i) => (
                  <AlbumCard 
                    key={i} 
                    {...album} 
                    queue={latest.filter(t => t.link)}
                  />
                ))
              )}
            </div>
          </section>

          {madeForYou.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Made For You</h3>
                <a href="#" className="text-xs md:text-sm font-bold text-white/40 hover:text-primary transition-colors">Show all</a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {madeForYou.map((item, i) => (
                  <AlbumCard 
                    key={i} 
                    {...item} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
