import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AlbumCard from "@/components/AlbumCard";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("search_history");
    return saved ? JSON.parse(saved) : [];
  });

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    // Save to history
    setHistory(prev => {
      const newHistory = [searchTerm, ...prev.filter(h => h !== searchTerm)].slice(0, 10);
      localStorage.setItem("search_history", JSON.stringify(newHistory));
      return newHistory;
    });

    try {
      const res = await fetch(`https://spotify.cocspedsafliz.workers.dev/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || data.data || [];
      
      const mappedResults = items.map((item: any) => ({
        title: item.title || item.name,
        artist: item.artist || item.subtitle || "Various Artists",
        image: item.image || item.cover || item.thumbnail || "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=400&h=400&fit=crop",
        link: item.link || item.url || item.spotify_url
      }));
      
      setResults(mappedResults);

      // Background fetch for faster play
      mappedResults.slice(0, 5).forEach(async (item: any) => {
        if (item.link) {
          try {
            const r = await fetch(`https://spotify.elfar.my.id/api/spotify?link=${encodeURIComponent(item.link)}`);
            const d = await r.json();
            if (d.download) {
              setResults(prev => prev.map(res => res.link === item.link ? { ...res, audioUrl: d.download } : res));
            }
          } catch (e) {}
        }
      });
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const removeHistory = (e: React.MouseEvent, h: string) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item !== h);
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const categories = [
    { title: "Pop", color: "bg-pink-500", image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=400&h=400&fit=crop" },
    { title: "Hip-Hop", color: "bg-orange-500", image: "https://images.unsplash.com/photo-1508919892461-627395024e68?w=400&h=400&fit=crop" },
    { title: "Rock", color: "bg-red-600", image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop" },
    { title: "Electronic", color: "bg-purple-600", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
    { title: "Jazz", color: "bg-blue-600", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop" },
    { title: "Indie", color: "bg-green-600", image: "https://images.unsplash.com/photo-1459749411177-8c29142af60e?w=400&h=400&fit=crop" },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-20">
        <h2 className="text-3xl font-bold mb-8">Search</h2>
        <div className="relative mb-8 max-w-lg group">
          <Input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?" 
            className="w-full bg-white/10 border-none rounded-full py-6 px-12 focus-visible:ring-2 focus-visible:ring-primary transition-all text-white placeholder:text-white/40"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors">
            <SearchIcon className="w-5 h-5" />
          </span>
        </div>

        {history.length > 0 && !query && (
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4">Recent searches</h3>
            <div className="flex flex-wrap gap-3">
              {history.map((h, i) => (
                <div 
                  key={i} 
                  onClick={() => setQuery(h)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full cursor-pointer group transition-all border border-transparent hover:border-white/10"
                >
                  <span className="text-sm font-medium">{h}</span>
                  <button 
                    onClick={(e) => removeHistory(e, h)}
                    className="text-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {query.trim() ? (
          <>
            <h3 className="text-xl font-bold mb-6">Search Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-md bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                ))
              ) : results.length > 0 ? (
                results.map((item, i) => (
                  <AlbumCard key={i} {...item} queue={results} />
                ))
              ) : (
                <p className="text-white/40 col-span-full">No results found for "{query}"</p>
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6">Browse all</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {categories.map((cat) => (
                <div key={cat.title} className={`${cat.color} rounded-xl aspect-square p-4 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform shadow-lg`}>
                  <span className="text-xl font-bold relative z-10">{cat.title}</span>
                  <img 
                    src={cat.image} 
                    className="absolute -right-4 -bottom-4 w-24 h-24 rotate-[25deg] shadow-2xl group-hover:scale-110 transition-transform opacity-80" 
                    alt=""
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
