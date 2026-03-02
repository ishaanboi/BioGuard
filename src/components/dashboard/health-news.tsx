"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getHealthNews, Article } from "@/app/actions/news";

export function HealthNews() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [useMock, setUseMock] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const { articles: fetchedArticles } = await getHealthNews();
                setArticles(fetchedArticles);

                // Heuristic to check if it's mock data (mock data has specific titles or we just trust the result)
                // If the action returns mock, it means key was missing or error occurred.
                // We'll trust the result.
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Duplicate articles for seamless loop
    const carouselItems = [...articles, ...articles];

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/20">
                            <Newspaper className="w-6 h-6 text-blue-400" />
                        </div>
                        Health Insights
                    </h2>
                    <p className="text-blue-200/50 text-sm mt-2 ml-12">Live updates from the medical world.</p>
                </div>
                {useMock && <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold border border-white/10 px-3 py-1.5 rounded-full bg-white/5">Simulated</span>}
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden mask-linear-gradient">
                <motion.div
                    className="flex gap-6 w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: articles.length * 5 // Dynamic duration based on count
                    }}
                    whileHover={{ animationPlayState: "paused" }}
                >
                    {carouselItems.map((article, i) => (
                        <div key={i} className="w-[300px] md:w-[350px] flex-shrink-0 group flex flex-col justify-between bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl h-full backdrop-blur-sm">
                            <div className="relative h-44 w-full overflow-hidden">
                                <img
                                    src={article.urlToImage || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=2070'}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-bold tracking-wider uppercase border border-white/10">
                                    {article.source.name}
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-white font-semibold mb-3 line-clamp-2 leading-snug tracking-tight group-hover:text-blue-300 transition-colors">
                                    {article.title}
                                </h3>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                    <span className="text-[11px] font-medium tracking-wider text-white/40 uppercase">
                                        {new Date(article.publishedAt).toLocaleDateString()}
                                    </span>
                                    <Button size="sm" variant="ghost" className="h-8 text-blue-400 hover:text-white hover:bg-white/10 rounded-lg px-3" asChild>
                                        <a href={article.url} target="_blank" rel="noreferrer" className="text-xs font-semibold">
                                            Read <ExternalLink className="w-3 h-3 ml-1.5" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Gradient Masks for fade effect (matching dashboard background #080c17) */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080c17] via-[#080c17]/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080c17] via-[#080c17]/80 to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
}
