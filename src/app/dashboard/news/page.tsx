"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Newspaper, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    source: { name: string };
    publishedAt: string;
}

// Reuse Mock Data for resiliency
const MOCK_NEWS: Article[] = [
    {
        title: "Global Health Summit 2026: Key Takeaways",
        description: "Leaders from around the world gathered to discuss the future of pandemic prevention and AI in healthcare.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070",
        source: { name: "Global Health" },
        publishedAt: new Date().toISOString()
    },
    // ... add more mocks if needed or keep it simple
];

export default function NewsPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

    const fetchNews = async (searchQuery = "", pageToken = "") => {
        if (!apiKey) {
            setArticles(MOCK_NEWS);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            let url = "";

            if (apiKey.startsWith('pub_')) {
                // NewsData.io
                const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
                const pageParam = pageToken ? `&page=${pageToken}` : "";
                url = `https://newsdata.io/api/1/news?apikey=${apiKey}&category=health&language=en${queryParam}${pageParam}`;
            } else {
                // NewsAPI.org
                const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
                const pageParam = pageToken ? `&page=${pageToken}` : ""; // NewsAPI uses distinct logic, simplified here for primary fallback
                url = `https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${apiKey}${queryParam}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (apiKey.startsWith('pub_')) {
                if (data.status === "success" && data.results) {
                    const mapped = data.results.map((item: any) => ({
                        title: item.title,
                        description: item.description,
                        url: item.link,
                        urlToImage: item.image_url,
                        source: { name: item.source_id },
                        publishedAt: item.pubDate
                    }));

                    setArticles(prev => pageToken ? [...prev, ...mapped] : mapped);
                    setNextPage(data.nextPage || null);
                }
            } else {
                if (data.status === "ok" && data.articles) {
                    setArticles(data.articles);
                }
            }
        } catch (error) {
            console.error("News fetch error:", error);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        fetchNews(query);
    };

    const handleLoadMore = () => {
        if (nextPage) {
            fetchNews(query, nextPage);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-headline font-black text-white mb-2">Medical News</h1>
                    <p className="text-blue-200/60 font-medium">Curated health updates tailored for you.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/40 w-4 h-4" />
                        <Input
                            placeholder="Search topics (e.g. 'Vaccine')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="bg-white/5 border-white/10 pl-10 text-white focus:border-blue-500/50"
                        />
                    </div>
                    <Button type="submit" disabled={isSearching} className="bg-blue-600 hover:bg-blue-500 text-white">
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                    </Button>
                </form>
            </div>

            {loading && articles.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {articles.map((article, i) => (
                            <motion.div
                                key={article.url + i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex flex-col justify-between bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors h-full"
                            >
                                <div className="relative h-48 w-full overflow-hidden bg-black/40">
                                    {article.urlToImage ? (
                                        <img
                                            src={article.urlToImage}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=2070';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Newspaper className="w-10 h-10 text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs text-white font-medium">
                                        {article.source.name || "Unknown Source"}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-3 leading-snug group-hover:text-blue-400 transition-colors">
                                        {article.title}
                                    </h3>

                                    <p className="text-blue-200/60 text-sm line-clamp-3 mb-6 flex-1">
                                        {article.description || "Click to read full article content from the source."}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <span className="text-xs text-white/30 font-mono">
                                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                                        </span>
                                        <Button size="sm" variant="ghost" className="h-8 text-blue-400 hover:text-white group/btn" asChild>
                                            <a href={article.url} target="_blank" rel="noreferrer">
                                                Read Article <ExternalLink className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {nextPage && !loading && (
                <div className="flex justify-center pt-8">
                    <Button onClick={handleLoadMore} variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        Load More News
                    </Button>
                </div>
            )}

            {!loading && articles.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-blue-200/40 text-lg">No medical news found. Try a different search term.</p>
                </div>
            )}
        </div>
    );
}
